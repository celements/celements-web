#!/bin/sh
##
## See the NOTICE file distributed with this work for additional
## information regarding copyright ownership.
##
## This is free software; you can redistribute it and/or modify it
## under the terms of the GNU Lesser General Public License as
## published by the Free Software Foundation; either version 2.1 of
## the License, or (at your option) any later version.
##
## This software is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
## Lesser General Public License for more details.
##
## You should have received a copy of the GNU Lesser General Public
## License along with this software; if not, write to the Free
## Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
## 02110-1301 USA, or see the FSF site: http://www.fsf.org.
##

cd /var/lib/tomcat5.5/webapps/xwiki/
mkdir new_resources
mkdir new_resources/js
mkdir new_resources/js/smartclient
mkdir new_resources/uicomponents
mkdir new_resources/uicomponents/viewers
mkdir new_resources/uicomponents/widgets
mkdir new_resources/uicomponents/widgets/colorpicker
mkdir new_resources/uicomponents/search
mkdir new_resources/uicomponents/pagination
mkdir new_resources/js/xwiki
mkdir new_resources/js/xwiki/wysiwyg
mkdir new_resources/js/xwiki/wysiwyg/xwe
mkdir new_resources/js/xwiki/lightbox
mkdir new_resources/js/xwiki/viewers
mkdir new_resources/js/xwiki/usersandgroups
mkdir new_resources/js/xwiki/editors
mkdir new_resources/js/xwiki/xwikiexplorer
mkdir new_resources/js/xwiki/table

grep -r 'getSkinFile([^,)]*)' resources | awk -F':' '{print $1}' \
| while read fname ; do
 echo "new_$fname"
 sed -r "s/getSkinFile\(([^),]*)\)/getSkinFile(\1, true)/g" $fname > new_$fname
done

cp -r resources resources_old && \
(mv new_resources/uicomponents/viewers/* resources/uicomponents/viewers/ ; \
rmdir new_resources/uicomponents/viewers ; \
mv new_resources/uicomponents/widgets/colorpicker/* resources/uicomponents/widgets/colorpicker/ ; \
rmdir new_resources/uicomponents/widgets/colorpicker ; \
mv new_resources/uicomponents/widgets/* resources/uicomponents/widgets/ ; \
rmdir new_resources/uicomponents/widgets ; \
mv new_resources/uicomponents/search/* resources/uicomponents/search/ ; \
rmdir new_resources/uicomponents/search ; \
mv new_resources/uicomponents/pagination/* resources/uicomponents/pagination/ ; \
rmdir new_resources/uicomponents/pagination ; \
mv new_resources/uicomponents/* resources/uicomponents/ ; \
rmdir new_resources/uicomponents ; \
mv new_resources/js/smartclient/* resources/js/smartclient/ ; \
rmdir new_resources/js/smartclient ; \
mv new_resources/js/xwiki/wysiwyg/xwe/* resources/js/xwiki/wysiwyg/xwe/ ; \
rmdir new_resources/js/xwiki/wysiwyg/xwe ; rmdir new_resources/js/xwiki/wysiwyg ; \
mv new_resources/js/xwiki/lightbox/* resources/js/xwiki/lightbox/ ; \
rmdir new_resources/js/xwiki/lightbox ; \
mv new_resources/js/xwiki/viewers/* resources/js/xwiki/viewers/ ; \
rmdir new_resources/js/xwiki/viewers ; \
mv new_resources/js/xwiki/usersandgroups/* resources/js/xwiki/usersandgroups/ ; \
rmdir new_resources/js/xwiki/usersandgroups ; \
mv new_resources/js/xwiki/editors/* resources/js/xwiki/editors/ ; \
rmdir new_resources/js/xwiki/editors ; \
mv new_resources/js/xwiki/xwikiexplorer/* resources/js/xwiki/xwikiexplorer/ ; \
rmdir new_resources/js/xwiki/xwikiexplorer ; \
mv new_resources/js/xwiki/table/* resources/js/xwiki/table/ ; \
rmdir new_resources/js/xwiki/table ; \
rmdir new_resources/js/xwiki ; \
rmdir new_resources/js ; \
rmdir new_resources )