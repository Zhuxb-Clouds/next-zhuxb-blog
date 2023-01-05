#!/bin/bash
cd "/var/www/next-zhuxb-blog/"

git checkout main

git pull

yarn build

pm2 restart blog --watch

exit