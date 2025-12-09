/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package com.celements.web.selenium;

import static org.junit.Assume.*;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;

import com.celements.common.test.SeleniumConfig;

public class SeleniumExampleTest {

  SeleniumConfig seleniumConfig;
  WebDriver selenium;

  @Before
  public void setUpSeleniumExampleTest() throws Exception {
    seleniumConfig = new SeleniumConfig();
    // TODO migrate to selenium 3.x
    // selenium = seleniumConfig.getSelenium();
    seleniumConfig.Login();
  }

  @Test
  public void testSeleniumExample() throws Exception {
    // selenium.open("/");
    // assertTrue(selenium.isTextPresent(""));
  }

  @Test
  public void testSeleniumExampleIEOnly() throws Exception {
    assumeTrue(seleniumConfig.isIE());
    // selenium.open("/");
    // assertTrue(selenium.isTextPresent(""));
  }

  @After
  public void tearDownSeleniumExampleTest() throws Exception {
    // _seleniumConfig.Logout();
    seleniumConfig.stopSelenium();
  }
}
