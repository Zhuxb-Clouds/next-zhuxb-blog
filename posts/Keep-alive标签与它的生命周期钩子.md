---
title: "Keep-alive标签与它的生命周期钩子"
date: "2022-08-08"
tag: "Vue2"
---

# Keep-alive释义

当我们使用路由的时候，在不同的组件之间切换，这些组件其实在不断经历被创建、被销毁的过程。某些情况下，我们并不希望组件被销毁，或是我们希望保留一些data在我们切换组件之后。为了解决这个问题，我们可以用一个 `<keep-alive>` 元素将其动态组件包裹起来。

```html
<!-- 失活的组件将会被缓存！-->
<keep-alive>
  <component v-bind:is="currentTabComponent"></component>
</keep-alive>
```

- 注意这个 `<keep-alive>` 要求被切换到的组件都有自己的名字，不论是通过组件的 `name` 选项还是局部/全局注册。

## 它是什么

- `keep-alive`是一个`Vue全局组件`
- `keep-alive`本身不会渲染出来，也不会出现在父组件链中
- `keep-alive`包裹动态组件时，会缓存不活动的组件，而不是销毁它们

## 它的用法

- [keep-alive](https://cn.vuejs.org/v2/api/#keep-alive)

  - **Props**：

    - `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存。
    - `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。
    - `max` - 数字。最多可以缓存多少组件实例。

  - **用法**：

    `<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。和 `<transition>` 相似，`<keep-alive>` 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在组件的父组件链中。

    当组件在 `<keep-alive>` 内被切换，它的 `activated` 和 `deactivated` 这两个生命周期钩子函数将会被对应执行。

# 扯点别的：Vue的渲染方式

在编译结束之后，vue开始渲染各个组件。

- `render`：此函数会将组件转成`VNode`
- `patch`：此函数在初次渲染时会直接渲染根据拿到的`VNode`直接渲染成`真实DOM`，第二次渲染开始就会拿`VNode`会跟`旧VNode`对比，打补丁（diff算法对比发生在此阶段），然后渲染成`真实DOM`

那么，Keep-alive是如何渲染的呢？

`keep-alive`自身组件不会被渲染到页面上，换言之，它不会生成真正的DOM节点。它通过判断组件实例上的`abstract`的属性值，如果是`true`的话，就跳过该实例，该实例也不会出现在父级链上。

> 在 2.2.0 及其更高版本中，`activated` 和 `deactivated` 将会在 `<keep-alive>` 树内的所有嵌套组件中触发。

**`<keep-alive>` 不会在函数式组件中正常工作，因为它们没有缓存实例。**

# 相关的两个生命周期钩子

### activated

- **类型**：`Function`

- **详细**：

  被 keep-alive 缓存的组件激活时调用。

  **该钩子在服务器端渲染期间不被调用**

### deactivated

- **类型**：`Function`

- **详细**：

  被 keep-alive 缓存的组件失活时调用。

  **该钩子在服务器端渲染期间不被调用。**

