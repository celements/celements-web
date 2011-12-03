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
import static org.junit.Assert.*;
import static org.junit.Assume.*;

import com.celements.common.test.SeleniumConfig;
import com.thoughtworks.selenium.*;
import org.junit.*;

public class SeleniumExampleTest
{     
  SeleniumConfig _seleniumConfig;
  DefaultSelenium _selenium;

  @Before
  public void setUpSeleniumExampleTest() throws Exception {
    _seleniumConfig = new SeleniumConfig(); 
    _selenium = _seleniumConfig.getSelenium();
    _seleniumConfig.Login();
  }

  @Test
  public void testSeleniumExample() throws Exception { 
    _selenium.open("/");
    assertTrue(_selenium.isTextPresent(""));
  } 
  
  @Test
  public void testSeleniumExampleIEOnly() throws Exception { 
    assumeTrue(_seleniumConfig.isIE());
    _selenium.open("/");
    assertTrue(_selenium.isTextPresent(""));
  }
  
  @After
  public void tearDownSeleniumExampleTest() throws Exception{
//    _seleniumConfig.Logout();
    _seleniumConfig.stopSelenium();
  }
}