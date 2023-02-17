---
title: "基于GithubAction的CI/CD尝试"
date: "2023-02-17"
tag: "Vue"
---

# CI/CD 的定义

> CI/CD falls under DevOps (the joining of development and operations teams) and combines the practices of continuous integration and continuous delivery.

换言之，CI/CD就是在产品不断的更改部署中寻求自动化的一个流程，简化了测试、部署、交付等等机械性工作。

当然，对于独立开发来说，它最大的效果就是减少了登录服务器的次数，不必每一次修改的时候都要在服务器一次又一次部署。

# Github Action

不得不说，Github Action确实是好用，它可以直接监听一个被托管项目的活动（比如push、pr），并通过.github/workflow直接配置需要完成的jobs，即使是部署，也可以通过别人做好的Action完成。简单高效

## 使用方法

在`.github/workflows`下创建yml文件，它会出现在GithubAction界面

`dev.yml`
```yml
name: dev-ci
on:
  push:
    branches:
      - master
```
name设定流程名称，on则可以指定监听的活动及其branch。

需要注意的是：一个步骤前面只能有一个`- `，比如use、name、run，如果使用了name，下方的use或run就不需要加了。

```yml
jobs:
  deploy_ghpages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 12.16.1
      - name: build static page
        run: |
          node ./script/run.js
          npm install gitbook-cli -g
          gitbook install
          gitbook build
      - name: deploy
        uses: cross-the-world/scp-pipeline@master
        with:
          host: ${{ secrets.MY_HOST }} # 服务器IP（需要在GitHub上自行配置对应的secret）
          user: ${{ secrets.MY_USER }} # 服务器用户名
          pass: ${{ secrets.MY_PASS }} # 服务器密码
          connect_timeout: 10s
          local: "./_book/*" # 源路径（工作流）
          remote: /var/www/ZFS-mds # 目标路径（服务器）
```