package com.celements.web.api;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

import javax.inject.Inject;
import javax.servlet.ServletContext;

import org.apache.velocity.VelocityContext;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xwiki.velocity.VelocityManager;
import org.xwiki.velocity.XWikiVelocityException;

import com.celements.spring.security.AuthenticatedBaseController;
import com.celements.web.service.IPrepareVelocityContext;

@RestController
@RequestMapping("/v1/messages")
@PreAuthorize("permitAll()")
public class MessagesController extends AuthenticatedBaseController {

  private final ServletContext servletContext;

  private final VelocityManager velocityManager;

  private final IPrepareVelocityContext prepareVelocityContext;

  @Inject
  public MessagesController(ServletContext servletContext, VelocityManager velocityManager,
      IPrepareVelocityContext prepareVelocityContext) {
    this.servletContext = servletContext;
    this.velocityManager = velocityManager;
    this.prepareVelocityContext = prepareVelocityContext;
  }

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
  public String getMessages() throws IOException, XWikiVelocityException {
    return renderTemplate("/templates/celAjax/Messages.vm");
  }

  @GetMapping(value = "/validation", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
  public String getValidationMessages() throws IOException, XWikiVelocityException {
    return renderTemplate("/templates/celAjax/ValidationMessages.vm");
  }

  private String renderTemplate(String template) throws IOException, XWikiVelocityException {
    checkAuth();
    VelocityContext velocityContext = velocityManager.getVelocityContext();
    prepareVelocityContext.prepareVelocityContext(velocityContext);
    var writer = new StringWriter();
    velocityManager.getVelocityEngine().evaluate(velocityContext, writer, template,
        getTemplateContent(template));
    return writer.toString().trim();
  }

  private String getTemplateContent(String template) throws IOException {
    try (InputStream stream = servletContext.getResourceAsStream(template)) {
      if (stream == null) {
        throw new IOException("Template not found: " + template);
      }
      return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }
  }
}
