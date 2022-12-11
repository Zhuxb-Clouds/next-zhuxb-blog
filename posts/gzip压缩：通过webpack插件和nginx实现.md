---
title: "gzip压缩：通过webpack插件和nginx实现"
date: "2022-11-30"
tag: "Webpack,Nginx,前端工程化"
---


在通过Vue3与element-plus写SPA并构建之后，我发现总有一个文件会拥有1m以上的大小。在部署到服务器之后，这个文件会变成阻碍渲染的罪魁祸首。在用户第一次加载的时候，它需要40-60s的时间去获取，换言之，用户有40s的白屏时间，这简直是无法仍受的。

尽管我按需映入element、压缩图片大小（此处指png->webp）依然无法降低等待时长，最后我将目光投向了gzip压缩。

前端使用 webpack 插件 CompressionWebpackPlugin 压缩，后端使用 nginx 配置。

首先安装插件 `npm install compression-webpack-plugin --save-dev` ,接着进入工程下的 vue.config.js 修改

```JavaScript
const CompressionPlugin = require("compression-webpack-plugin");
// 引入插件
module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      new CompressionPlugin({
        filename: "[path][base].gz", //压缩文件名称
        algorithm: "gzip", //压缩算法
        test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i, //插件压缩的文件
        threshold: 10240, // 压缩门槛
        minRatio: 0.8, // 最小压缩比
        deleteOriginalAssets: false, //是否删除原资源，
        compressionOptions: { level: 6 }, //压缩程度
      }),
    ],
  },
});

```

压缩成功后，添加 nginx 配置`gzip on` 

最后附上压缩比例表格

| 压缩前大小  | 压缩后大小 | 压缩比例 | 压缩等级 | 备注    |
| :---------- | ---------- | -------- | -------- | ------- |
| 1118.78 KiB | 330.37 KiB | -71%     | 9        | js文件  |
| 27.26 KiB   | 9.62 KiB   | -65%     | 9        | js文件  |
| 398.48 KiB  | 49.96 KiB  | -88%     | 9        | css文件 |
| 1.65 KiB    | 0.65 KiB   | -61%     | 9        | css文件 |

大部分文件都能减少六成及以上的体积，在实际测试中，首屏渲染的时间从40-50s下降到了4-5s，提速了接近十倍！