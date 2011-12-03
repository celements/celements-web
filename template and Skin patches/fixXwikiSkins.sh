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
mkdir new_skins
mkdir new_skins/albatross
mkdir new_skins/toucan
mkdir new_skins/colibri

grep -r 'getSkinFile([^,)]*)' skins | awk -F':' '{print $1}' \
| while read fname ; do
 sed -r "s/getSkinFile\(([^),]*)\)/getSkinFile(\1, true)/g" $fname > new_$fname
done

cp -r skins skins_old && (\
mv new_skins/albatross/* skins/albatross/ ; \
rmdir new_skins/albatross ; \
mv new_skins/toucan/* skins/toucan/ ; \
rmdir new_skins/toucan ; \
mv new_skins/colibri/* skins/colibri/ ; \
rmdir new_skins/colibri ; \
rmdir new_skins)
