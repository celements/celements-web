/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 * Licensed under the GNU Lesser General Public License, version 2.1 or later.
 */
package com.celements.web;

import static org.easymock.EasyMock.anyObject;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.getCurrentArgument;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.xwiki.context.Execution;

import com.celements.common.test.AbstractComponentTest;
import com.celements.init.request.CelementsRequestFilter;
import com.celements.init.request.ExecutionContextFilter;
import com.celements.presentation.rest.PresentationApiService;
import com.celements.presentation.rest.PresentationController;
import com.celements.presentation.rest.PresentationResponse;
import com.xpn.xwiki.XWiki;
import com.xpn.xwiki.XWikiContext;
import com.xpn.xwiki.XWikiException;
import com.xpn.xwiki.doc.XWikiDocument;
import com.xpn.xwiki.web.XWikiServletRequest;
import com.xpn.xwiki.web.XWikiServletResponse;

public class PresentationApiRequestFilterTest extends AbstractComponentTest {

  private CelementsRequestFilter requestFilter;
  private PresentationApiService presentationService;
  private MockMvc mockMvc;

  @Before
  public void prepareTest() {
    requestFilter = createDefaultMock(CelementsRequestFilter.class);
    presentationService = createDefaultMock(PresentationApiService.class);
    var beanFactory = (DefaultListableBeanFactory) getBeanFactory();
    beanFactory.removeBeanDefinition(CelementsRequestFilter.class.getName());
    beanFactory.registerSingleton("celementsRequestFilter", requestFilter);
    mockMvc = MockMvcBuilders.standaloneSetup(new PresentationController(presentationService))
        .addFilters(new ExecutionContextFilter()).build();
  }

  @Test
  public void test_explicitLanguageReachesPresentationResponse() throws Exception {
    expectLanguageInitialization();
    expect(presentationService.getPresentation(List.of("Content.WebHome"), 1))
        .andAnswer(() -> presentationResponse());
    replayDefault();
    var result = mockMvc.perform(get("/v1/presentations")
        .param("presentationConfigFullName", "Content.WebHome")
        .param("language", "fr")
        .accept("application/json"))
        .andExpect(status().isOk())
        .andReturn();
    assertTrue(result.getResponse().getContentAsString().contains("\"language\":\"fr\""));
    verifyDefault();
  }

  @Test
  public void test_acceptLanguageReachesPresentationResponse() throws Exception {
    expectLanguageInitialization();
    expect(presentationService.getPresentation(List.of("Content.WebHome"), 1))
        .andAnswer(() -> presentationResponse());
    replayDefault();
    var result = mockMvc.perform(get("/v1/presentations")
        .param("presentationConfigFullName", "Content.WebHome")
        .header(HttpHeaders.ACCEPT_LANGUAGE, "it")
        .accept("application/json"))
        .andExpect(status().isOk())
        .andReturn();
    assertTrue(result.getResponse().getContentAsString().contains("\"language\":\"it\""));
    verifyDefault();
  }

  private void expectLanguageInitialization() throws Exception {
    expect(requestFilter.preExecute(anyObject(HttpServletRequest.class),
        anyObject(HttpServletResponse.class))).andAnswer(() -> {
          HttpServletRequest request = getCurrentArgument(0);
          HttpServletResponse response = getCurrentArgument(1);
          XWikiContext context = getXContext();
          context.setLanguage(null);
          context.setRequest(new XWikiServletRequest(request));
          context.setResponse(new XWikiServletResponse(response));
          new RequestLanguageXWiki().getLanguagePreference(context);
          return getBeanFactory().getBean(Execution.class).getContext();
        });
    requestFilter.postExecute();
    expectLastCall();
  }

  private PresentationResponse presentationResponse() {
    return new PresentationResponse("Content.WebHome", "default", getXContext().getLanguage(),
        List.of());
  }

  private static class RequestLanguageXWiki extends XWiki {

    @Override
    public String getDefaultLanguage(XWikiContext context) {
      return "en";
    }

    @Override
    public boolean isMultiLingual(XWikiContext context) {
      return true;
    }

    @Override
    public String getUserPreferenceFromCookie(String preference, XWikiContext context) {
      return null;
    }

    @Override
    public XWikiDocument getDocument(String fullName, XWikiContext context) throws XWikiException {
      return null;
    }

    @Override
    public String Param(String key, String defaultValue) {
      return defaultValue;
    }

    @Override
    public String getSpacePreference(String preference, String defaultValue,
        XWikiContext context) {
      return defaultValue;
    }
  }
}
