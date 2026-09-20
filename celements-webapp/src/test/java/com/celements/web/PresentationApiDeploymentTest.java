/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 * Licensed under the GNU Lesser General Public License, version 2.1 or later.
 */
package com.celements.web;

import static org.junit.Assert.assertEquals;

import java.io.File;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.junit.Before;
import org.junit.Test;
import org.w3c.dom.Document;

public class PresentationApiDeploymentTest {

  private Document webXml;

  @Before
  public void prepareTest() throws Exception {
    webXml = parseXml("src/main/webapp/WEB-INF/web.xml");
  }

  private Document parseXml(String fileName) throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
    factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
    factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    factory.setXIncludeAware(false);
    factory.setExpandEntityReferences(false);
    return factory.newDocumentBuilder().parse(new File(fileName));
  }

  @Test
  public void test_descriptorMapsPresentationApiWithoutPermissiveCors() throws Exception {
    assertEquals("org.springframework.web.servlet.DispatcherServlet",
        evaluate(webXml, "string(/*[local-name()='web-app']/*[local-name()='servlet']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='servlet-class'])"));
    assertEquals("org.springframework.web.context.WebApplicationContext.ROOT",
        evaluate(webXml, "string(/*[local-name()='web-app']/*[local-name()='servlet']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='init-param'][*[local-name()='param-name']='contextAttribute']"
            + "/*[local-name()='param-value'])"));
    assertEquals("/api/*",
        evaluate(webXml, "string(/*[local-name()='web-app']/*[local-name()='servlet-mapping']"
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

  private String evaluate(Document document, String expression) throws Exception {
    return (String) XPathFactory.newInstance().newXPath().evaluate(expression, document,
        XPathConstants.STRING);
  }

}
