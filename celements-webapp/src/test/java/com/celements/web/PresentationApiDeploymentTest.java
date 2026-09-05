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
  public void readWebXml() throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
    factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
    factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
    factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
    factory.setXIncludeAware(false);
    factory.setExpandEntityReferences(false);
    webXml = factory.newDocumentBuilder().parse(new File("src/main/webapp/WEB-INF/web.xml"));
  }

  @Test
  public void springDispatcherDeploysControllersBelowApi() throws Exception {
    assertEquals("org.springframework.web.servlet.DispatcherServlet",
        evaluate("string(/*[local-name()='web-app']/*[local-name()='servlet']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='servlet-class'])"));
    assertEquals("org.springframework.web.context.WebApplicationContext.ROOT",
        evaluate("string(/*[local-name()='web-app']/*[local-name()='servlet']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='init-param'][*[local-name()='param-name']='contextAttribute']"
            + "/*[local-name()='param-value'])"));
    assertEquals("/api/*",
        evaluate("string(/*[local-name()='web-app']/*[local-name()='servlet-mapping']"
            + "[*[local-name()='servlet-name']='spring-dispatcher']"
            + "/*[local-name()='url-pattern'])"));
  }

  private String evaluate(String expression) throws Exception {
    return (String) XPathFactory.newInstance().newXPath().evaluate(expression, webXml,
        XPathConstants.STRING);
  }

}
