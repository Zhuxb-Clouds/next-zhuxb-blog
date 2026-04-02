---
date: 2026-04-02
tags: [工程化,Renpy]
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

# Renpy打包CI/CD

Renpy也提供了linux平台的引擎版本和命令行打包的能力，自然也可以使用以上的方式去打包。

可以直接使用Renpy官网提供的Renpy版本构建产物，然后直接传入Github Release页面。

这里提供一个用来参考的yaml文件

```yaml
name: Build Ren'Py Game

on:
  push:
    tags:
      - "v*" # 推送 tag（如 v0.0.1）时触发构建
  workflow_dispatch: # 支持手动触发

env:
  RENPY_VERSION: "8.4.1" # Ren'Py SDK 版本，按需更新
  PROJECT_NAME: "" # 项目名称
  PROJECT_DIR: "." # 项目根目录

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write # 用于创建 Release

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          lfs: true # 如使用 Git LFS 管理大文件

      - name: Get version from tag
        id: version
        run: |
          if [[ "${{ github.ref_type }}" == "tag" ]]; then
            VERSION="${{ github.ref_name }}"
            VERSION="${VERSION#v}"
          else
            VERSION="dev-$(git rev-parse --short HEAD)"
          fi
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"
          echo "📦 Build version: $VERSION"

      - name: Cache Ren'Py SDK
        id: cache-renpy
        uses: actions/cache@v4
        with:
          path: ../renpy-sdk
          key: renpy-sdk-${{ env.RENPY_VERSION }}

      - name: Download Ren'Py SDK
        if: steps.cache-renpy.outputs.cache-hit != 'true'
        run: |
          SDK_URL="https://www.renpy.org/dl/${{ env.RENPY_VERSION }}/renpy-${{ env.RENPY_VERSION }}-sdk.tar.bz2"
          echo "⬇️  Downloading Ren'Py SDK from: $SDK_URL"
          curl -fSL "$SDK_URL" -o renpy-sdk.tar.bz2
          mkdir -p ../renpy-sdk
          tar xjf renpy-sdk.tar.bz2 --strip-components=1 -C ../renpy-sdk
          rm renpy-sdk.tar.bz2

      - name: Build market package (all platforms)
        run: |
          # 设置环境
          export SDL_AUDIODRIVER=dummy
          export SDL_VIDEODRIVER=dummy

          RENPY="../renpy-sdk/renpy.sh"
          LAUNCHER="../renpy-sdk/launcher"
          PROJECT_PATH="$(pwd)"

          echo "🔨 Building market package (Linux + Windows + macOS)..."
          echo "   Project: $PROJECT_PATH"
          echo "   SDK: $(pwd)/renpy-sdk"

          # 通过 launcher 调用 distribute，market 包含所有平台
          "$RENPY" "$LAUNCHER" \
            distribute "$PROJECT_PATH" \
            --destination "$(pwd)/dist" \
            --package "market" \
            --no-update

          echo "✅ Build complete"
          ls -lh dist/

      # ── 推送 tag 时，直接上传到 GitHub Release（不经过 Artifacts）──
      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          name: "Release ${{ github.ref_name }}"
          body: |
            ## 🎮 ${{ github.ref_name }}

            自动构建的游戏分发包（market 包，含全平台）。
          files: dist/*
          draft: false
          prerelease: ${{ contains(github.ref_name, '-') }} # 如 0.1.0-beta
          generate_release_notes: true

      # ── 手动触发时，上传为 Artifact 以便下载 ──
      - name: Upload build artifacts
        if: ${{ !startsWith(github.ref, 'refs/tags/') }}
        uses: actions/upload-artifact@v4
        with:
          name: ${{ env.PROJECT_NAME }}-${{ steps.version.outputs.version }}
          path: dist/*
          retention-days: 7
          if-no-files-found: error

```
