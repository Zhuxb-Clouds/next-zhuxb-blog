---
title: "使用flex制作手风琴效果"
date: "2022-01-03"
tag: "Css"
---

# 使用Flex布局和属性实现手风琴效果

通过flex布局的flex分配子元素大小和排列方式，再在hover伪类上使用flex-basis改变比例，实现hover手风琴特效。

## 实现代码

```html
<body>
    <div class="accodion">
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
        <div class="item"></div>
    </div>
</body>

<style>
    .accodion {
        background-color: rgba(0, 0, 0, 0.192);
        width: 600px;
        height: 400px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .item {
        flex: 1;
        background-color: rgb(90, 90, 90);
        position: relative;
        margin-bottom: 10px;
        border-radius: 20px;
        box-shadow: 5px 2px 5px rgba(0, 0, 0, 0.356);
        border: solid 2px rgb(255, 255, 255);
        margin: 2px 5px;
        transition: .2s;
    }

    .item:hover {
        flex-basis: 40%;
    }
</style>
```

