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
mkdir new_templates

grep -r '[sj]sfx.use([^,)]*)' templates | awk -F':' '{print $1}' \
| while read fname ; do
 sed -r "s/([sj])sfx.use\(([^,)]*)\)/\1sfx.use(\2, true)/g" $fname > new_$fname
done

cp -r templates templates_old2 && \
mv new_templates/* templates/ && \
rmdir new_templates

