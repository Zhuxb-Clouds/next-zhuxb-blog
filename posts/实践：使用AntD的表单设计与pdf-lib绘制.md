---
title: "实践：使用AntD的表单设计与pdf-lib绘制"
date: "2023-01-04"
tag: "Vue2, AntDesign, pdf-lib"
---

# 需求和设计思路

## 需求

一张三页纸的实体表格，要求填写内容并储存，能够预览下载pdf文件（要求前端实现）

## 设计思路

通过一个表单来填写内容，以Json格式存储，再使用pdf-lib绘制在空白pdf上。

# 代码实现

## 表单部分

```Vue
<template>
      <keep-alive>
        <component :is="formList[step]" ref="form"></component>
      </keep-alive>


      <a-button v-if="step != 0" @click="last"> 上一步 </a-button>
      <a-button v-if="step != 12" @click="next"> 下一步 </a-button>
      <a-button v-if="step == 12" type="primary" @click="saveForm"> 保存 </a-button>
</template>

<script>
export default {
  data() {
    return {
      step: 0,
      formList: [
        "baseInfo", //基本信息
        "healthCondition", // 健康状况
        "symptom", // 症状
        "dietExercise", // 饮食和锻炼
        "smokeStatus", // 吸烟状况
        "wineStatus", // 饮酒状况
        "hurtStatus", // 伤害
        "harmfulFactor", // 有害因素
        "hospitalization", // 住院治疗
        "medicationSituation", // 服药情况
        "vaccination", // 疫苗接种
        "selfCareAbility", // 生活自理能力
        "finalSign",
      ],
      formData: {},
    };
  },
  mounted() {},

  methods: {
    initData() {
      this.form = this.$form.createForm(this, { name: "new_question" });
    },
    afterVisibleChange() {
      this.initData();
    },
    onClose() {
      this.$emit("onClose", false);
    },
    async next() {
      if (await this.check()) {
        this.step++;
      }
    },
    async last() {
      if (await this.check()) {
        this.step--;
      }
    },
    async check() {
      let data = false;
      await this.$refs.form.check((err, value) => {
        data = !err ? value : false;
      });
      this.formData[this.step] = data;
      return data;
    },
    async saveForm() {
      if (await this.check()) {
        const data = {
          ...this.formData.baseInfo,
          ...this.formData.finalSign,
          allergyHistoryJson: this.formData,
        };
        console.log("data", data);
        await add(data);
        this.onClose();
      }
    },
  },
};
</script>


```

原本的表格太长太多，故分成多个模块组件，使用`<component>`加载，通过`step`控制显隐，并且被`<keep-alive>`包裹缓存表单模块数据，实现上一步和下一步的能力。

在点击上一步与下一步之前，调用每个组件的`check`方法，校验表单。

这个地方曾经碰到一个问题，原本组件内的check想要根据校验来返回值，但是由于AntDesign表单验证异步，并且`validateFields`函数本身是没有返回值的，所以只能在`validateFields`函数的回调内部判断是否抛出错误来校验。此处尝试能否以await来同步回调，然而效果是返回了一个一直*pending*的Promise。

于是，这里直接向组件内的check函数传了回调函数。

```
 check(callback) {
      this.form.validateFieldsAndScroll(callback);
 },
```

## 绘制部分

从后端拿到数据之后，先创建一个pdf对象，传入待写入的空白pdf。

```javascript
import Pdf from "@/libs/pdf.js";
this.pdf = new Pdf(require("@/assets/pdf/health-naire.pdf").default);
```



### pdf类实现

```javascript
import { PDFDocument } from "pdf-lib";
import option from "./pdfOption.js";
export default class pdf {
  #pdfUrl;
  pdfData;
  constructor(pdfUrl) {
    this.#pdfUrl = pdfUrl;
  }
  async getPdfDataByUrl() {
    const res = await fetch(this.#pdfUrl).then((response) => response);
    const blob = new Blob([await res.blob()], { type: "application/pdf;Base64" });
    this.pdfData = blob;
    return this;
  }
  async download(filename) {
    const a = document.createElement("a");
    a.style = "display: none"; // 创建一个隐藏的a标签
    a.href = URL.createObjectURL(this.pdfData);
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click(); // 触发a标签的click事件
    document.body.removeChild(a);
  }
  view() {
    console.log("see");
    const a = document.createElement("a");
    a.target = "_blank";
    a.href = window.URL.createObjectURL(this.pdfData);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  async draw(data) {
    await this.getPdfDataByUrl();
    await this.#d(data);
  }

  async #d(data) {
    const pdfDoc = await PDFDocument.load(await this.pdfData.arrayBuffer());
    this.pdfDoc = pdfDoc;
    const pages = pdfDoc.getPages();
    //遍历方法
    await this.traversal(pages, data);
    const pdfBytes = await pdfDoc.save();
    this.pdfData = new Blob([pdfBytes], { type: "application/pdf;Base64" });
  }
  traversal(pages, data) {
    option.map((i) => {
      try {
        let temp = i.handle(data);
        if (Array.isArray(temp) && temp.length != 0) {
          temp.map((line) => this.render(pages[i.page], line.text, line));
        } else if (temp) {
          temp.text ? this.render(pages[i.page], temp.text, temp) : null;
        } else {
          throw new Error(i.key);
        }
      } catch (error) {
        console.log("error", error.message);
      }
    });
  }

  async render(page, text, params) {
    if (!text) {
      return;
    }
    const { height } = page.getSize();
    const data = await textBecomeImg(text, 10, "#000");
    const _img = await this.pdfDoc.embedPng(data);
    page.drawImage(_img, {
      x: params.x,
      y: height - params.y,
      width: text.length * 10 + 4,
      height: 12,
    });
  }
}
/**
 * js使用canvas将文字转换成图像数据base64
 * @param {string}    text              文字内容  "abc"
 * @param {string}    fontsize          文字大小  20
 * @param {function}  fontcolor         文字颜色  "#000"
 * @param {boolean}   imgBase64Data     图像数据
 */
async function textBecomeImg(text, fontsize, fontcolor) {
  if (!text) {
    return;
  }
  fontsize *= 2;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = text.length * fontsize + 10;
  canvas.width = width;
  canvas.height = fontsize + 4;
  //透明背景色
  ctx.clearRect(0, 0, width, fontsize + 4);
  //绘制文本
  ctx.fillStyle = fontcolor;
  ctx.font = `${fontsize}px serif`;
  ctx.fillText(text, 0, 20);
  //注意这里背景透明的话，需要使用png
  let dataUrl = canvas.toDataURL("image/png");
  return dataUrl;
}


```

在pdfOption中是对json字段的处理，返回字符和位置绘制。

原本是直接绘制字符，但是某些生僻字与字符串会错误，遂改为先绘制在canvas上，然后使用图片绘制在pdf上。

