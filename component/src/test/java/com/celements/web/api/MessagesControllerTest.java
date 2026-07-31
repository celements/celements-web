package com.celements.web.api;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.io.ByteArrayInputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import javax.servlet.ServletContext;

import org.apache.velocity.VelocityContext;
import org.junit.Before;
import org.junit.Test;
import org.xwiki.velocity.VelocityEngine;
import org.xwiki.velocity.VelocityManager;

import com.celements.auth.user.User;
import com.celements.web.service.IPrepareVelocityContext;

public class MessagesControllerTest {

  private ServletContext servletContext;

  private VelocityManager velocityManager;

  private IPrepareVelocityContext prepareVelocityContext;

  private MessagesController controller;

  @Before
  public void prepareTest() {
    servletContext = createMock(ServletContext.class);
    velocityManager = createMock(VelocityManager.class);
    prepareVelocityContext = createMock(IPrepareVelocityContext.class);
    controller = new TestMessagesController(servletContext, velocityManager, prepareVelocityContext);
  }

  @Test
  public void test_getMessages_rendersGeneralTemplateWithRequestVelocityContext() throws Exception {
    var velocityEngine = expectTemplateRendering("/templates/celAjax/Messages.vm",
        "  {\"message\":true}  ");
    replay(servletContext, velocityManager, prepareVelocityContext, velocityEngine);
    assertEquals("{\"message\":true}", controller.getMessages());
    assertTrue(((TestMessagesController) controller).isCheckAuthCalled());
    verify(servletContext, velocityManager, prepareVelocityContext, velocityEngine);
  }

  @Test
  public void test_getValidationMessages_rendersValidationTemplateWithRequestVelocityContext()
      throws Exception {
    var velocityEngine = expectTemplateRendering("/templates/celAjax/ValidationMessages.vm",
        "  {\"required\":true}  ");
    replay(servletContext, velocityManager, prepareVelocityContext, velocityEngine);
    assertEquals("{\"required\":true}", controller.getValidationMessages());
    assertTrue(((TestMessagesController) controller).isCheckAuthCalled());
    verify(servletContext, velocityManager, prepareVelocityContext, velocityEngine);
  }

  private VelocityEngine expectTemplateRendering(String template, String renderedTemplate)
      throws Exception {
    var velocityContext = new VelocityContext();
    VelocityEngine velocityEngine = createMock(VelocityEngine.class);
    expect(velocityManager.getVelocityContext()).andReturn(velocityContext);
    prepareVelocityContext.prepareVelocityContext(velocityContext);
    expect(velocityManager.getVelocityEngine()).andReturn(velocityEngine);
    expect(servletContext.getResourceAsStream(template)).andReturn(
        new ByteArrayInputStream("template".getBytes(StandardCharsets.UTF_8)));
    expect(velocityEngine.evaluate(same(velocityContext), isA(StringWriter.class), eq(template),
        eq("template"))).andAnswer(() -> {
          ((StringWriter) getCurrentArguments()[1]).write(renderedTemplate);
          return true;
        });
    return velocityEngine;
  }

  private static final class TestMessagesController extends MessagesController {

    private boolean checkAuthCalled;

    TestMessagesController(ServletContext servletContext, VelocityManager velocityManager,
        IPrepareVelocityContext prepareVelocityContext) {
      super(servletContext, velocityManager, prepareVelocityContext);
    }

    @Override
    protected Optional<User> checkAuth() {
      checkAuthCalled = true;
      return Optional.empty();
    }

    boolean isCheckAuthCalled() {
      return checkAuthCalled;
    }
  }
}
