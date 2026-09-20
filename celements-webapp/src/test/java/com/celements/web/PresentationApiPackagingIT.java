/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 * Licensed under the GNU Lesser General Public License, version 2.1 or later.
 */
package com.celements.web;

import static java.util.stream.Collectors.toList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.jar.JarFile;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.junit.Before;
import org.junit.Test;
import org.w3c.dom.Document;

public class PresentationApiPackagingIT {

  private static final String CONTROLLER_CLASS =
      "com/celements/presentation/rest/PresentationController.class";

  private Path explodedWebapp;
  private File packagedWar;

  @Before
  public void prepareTest() {
    explodedWebapp = Path.of("target", "celements-web");
    packagedWar = Path.of("target", "celements-web.war").toFile();
  }

  @Test
  public void test_assembledWarContainsPresentationController() throws Exception {
    assertTrue(Files.isDirectory(explodedWebapp));
    assertTrue(packagedWar.isFile());
    List<Path> presentationJars;
    try (var paths = Files.list(explodedWebapp.resolve("WEB-INF/lib"))) {
      presentationJars = paths
          .filter(path -> path.getFileName().toString().matches("celements-presentation-[^/]+\\.jar"))
          .collect(toList());
    }
    assertEquals(1, presentationJars.size());
    try (var presentationJar = new JarFile(presentationJars.get(0).toFile())) {
      assertNotNull(presentationJar.getJarEntry(CONTROLLER_CLASS));
    }
    try (var war = new JarFile(packagedWar)) {
      assertTrue(war.stream().anyMatch(entry -> entry.getName()
          .matches("WEB-INF/lib/celements-presentation-[^/]+\\.jar")));
    }
  }

  @Test
  public void test_effectiveDescriptorExcludesCorsFromPresentationApiChain() throws Exception {
    Document webXml = parseXml(explodedWebapp.resolve("WEB-INF/web.xml").toFile());
    assertEquals("/api/*", evaluate(webXml,
        "string(/*[local-name()='web-app']/*[local-name()='servlet-mapping']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='url-pattern'])"));
    assertEquals("action", evaluate(webXml,
        "string(/*[local-name()='web-app']/*[local-name()='filter-mapping']"
            + "[*[local-name()='filter-name']='CorsFilter']/*[local-name()='servlet-name'])"));
    assertEquals("", evaluate(webXml,
        "string(/*[local-name()='web-app']/*[local-name()='filter-mapping']"
            + "[*[local-name()='filter-name']='CorsFilter']/*[local-name()='url-pattern'])"));
    assertEquals("/*", evaluate(webXml,
        "string(/*[local-name()='web-app']/*[local-name()='filter-mapping']"
            + "[*[local-name()='filter-name']='executionContextFilter']"
            + "/*[local-name()='url-pattern'])"));
  }

  private Document parseXml(File file) throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
    factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
    factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    factory.setXIncludeAware(false);
    factory.setExpandEntityReferences(false);
    return factory.newDocumentBuilder().parse(file);
  }

  private String evaluate(Document document, String expression) throws Exception {
    return (String) XPathFactory.newInstance().newXPath().evaluate(expression, document,
        XPathConstants.STRING);
  }
}
