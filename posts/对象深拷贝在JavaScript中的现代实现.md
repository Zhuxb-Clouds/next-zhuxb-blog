---
title: "对象深拷贝在JavaScript中的现代实现"
date: "2024-07-07"
tag: "JavaScript,译文"
---

> 原文链接：https://www.builder.io/blog/structured-clone

你是否知道，现在有一种原生方式去实现JavaScript中的 **深拷贝** ？

没错，那就是`structuredClone`函数，它被内置在JavaScript运行时：

```javascript
const calendarEvent = {
  title: "Builder.io Conf"，
  date: new Date(123)，
  attendees: ["Steve"]
}


const copied = structuredClone(calendarEvent)
```

你是否注意到，在上面这个例子中我们不仅克隆了对象，同时也克隆了嵌套数组、甚至是日期对象？

并且一些像是我们期望的那样精准运行：

```javascript
copied.attendees // ["Steve"]
copied.date // Date: Wed Dec 31 1969 16:00:00
cocalendarEvent.attendees === copied.attendees // false
```

没错，`structuredClone`不仅如此，还支持：

- 无限嵌套的对象或数组
- 循环引用
- 各类数据结构，如`Date`， `Set`， `Map`， `Error`， `RegExp`， `ArrayBuffer`， `Blob`， `File`， `ImageData`...
- 转移任意的[可转移对象](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Transferable_objects)

例如这个例子：

```javascript
const kitchenSink = {
  set: new Set([1， 3， 3])，
  map: new Map([[1， 2]])，
  regex: /foo/，
  deep: { array: [ new File(someBlobData， 'file.txt') ] }，
  error: new Error('Hello!')
}
kitchenSink.circular = kitchenSink

// ✅ All good， fully and deeply copied!
const clonedSink = structuredClone(kitchenSink)
```

## 为什么不使用对象扩展符？

需要注意的是，我们当下讨论的是深克隆。如果你只需要做一个浅克隆（`shallow copy`），换言之不去拷贝那些嵌套对象或数组，我们可以直接使用对象扩展符：

```javascript
const simpleEvent = {
  title: "Builder.io Conf"，
}
// ✅ no problem， there are no nested objects or arrays
const shallowCopy = {...calendarEvent}
```

或者其他，看你的喜好：

```javascript
const shallowCopy = Object.assign({}， simpleEvent)
const shallowCopy = Object.create(simpleEvent)
```

但一旦嵌套了对象，就会产生问题：

```jsx
const calendarEvent = {
  title: "Builder.io Conf"，
  date: new Date(123)，
  attendees: ["Steve"]
}

const shallowCopy = {...calendarEvent}

// 🚩 oops - we just added "Bob" to both the copy *and* the original event
shallowCopy.attendees.push("Bob")

// 🚩 oops - we just updated the date for the copy *and* original event
shallowCopy.date.setTime(456)
```

如你所见，我们并未完全的复制这个对象。

嵌套Date对象和数组依然被两者共享引用，编辑其中一个，另外一个也会改变，这将带来重大隐患。

## 为什么不用`JSON.parse(JSON.stringify(x))`？

这确实是一个很好的技巧，并且它的性能出乎意料的好，但对比 `structuredClone` 依然有一些不足之处。
让我们看这个例子:

```javascript
const calendarEvent = {
  title: "Builder.io Conf"，
  date: new Date(123)，
  attendees: ["Steve"]
}

// 🚩 JSON.stringify 将 `date` 转换成了字符串
const problematicCopy = JSON.parse(JSON.stringify(calendarEvent))
```

如果我们打印 `problematicCopy`，我们会得到:

```json
{
  title: "Builder.io Conf"，
  date: "1970-01-01T00:00:00.123Z"
  attendees: ["Steve"]
}
```

这不是我们想要的!`date`应该是一个`Date`对象，而不是字符串。

这是因为`JSON.stringify`只能处理基本对象、数组和原始类型。其他类型的处理方式难以预测。例如，日期被转换为字符串。而`Set`则简单地被转换为`{}`。

`JSON.stringify`甚至完全忽略某些东西，比如`undefined`或函数。

例如，如果我们用这种方法复制我们的`kitchenSink`示例:

```javascript
const kitchenSink = {
  set: new Set([1， 3， 3])，
  map: new Map([[1， 2]])，
  regex: /foo/，
  deep: { array: [ new File(someBlobData， 'file.txt') ] }，
  error: new Error('Hello!')
}

const veryProblematicCopy = JSON.parse(JSON.stringify(kitchenSink))
```

我们会得到:

```json
{
  "set": {}，
  "map": {}，
  "regex": {}，
  "deep": {
    "array": [
      {}
    ]
  }，
  "error": {}，
}
```

这有点……

哦，对了，我们还得移除对象上原有的循环引用，因为`JSON.stringify`在遇到这种情况时会直接抛出错误。

所以虽然这种方法在我们的需求符合它能做到的情况下很棒，但还有很多`structuredClone`可以做到而这种方法做不到的事情（就像上面我们失败的）。

## 为什么不用 `_.cloneDeep`？

到目前为止，Lodash的`cloneDeep`函数一直是这个问题的一个很常见的解决方案。

实际上，它确实如预期那样工作:

```javascript
import cloneDeep from 'lodash/cloneDeep'

const calendarEvent = {
  title: "Builder.io Conf"，
  date: new Date(123)，
  attendees: ["Steve"]
}

const clonedEvent = cloneDeep(calendarEvent)
```

但是，这里只有一个小问题。根据我IDE中的Import Cost扩展(它会打印我导入的任何东西的kb成本)，这一个函数就占用了整整17.4kb的压缩大小(gzip压缩后5.3kb):

而且这假设你只导入了那个函数。如果你用更常见的方式导入，没有意识到tree shaking并不总是如你所希望的那样有效，你可能会意外地仅为这一个函数就导入高达25kb 😱

虽然这对任何人来说都不会是世界末日，但在我们的情况下这是无意义的，尤其是当浏览器已经内置了`structuredClone`的时候。

## `structuredClone`不能克隆的东西

### 函数无法被克隆

它将会抛出一个 `DataCloneError`：

```javascript
// 🚩 Error!
structuredClone({ fn: () => { } })
```

### DOM 节点

同样会抛出一个 `DataCloneError`：

```javascript
// 🚩 Error!
structuredClone({ el: document.body })
```

### 属性描述符、setter、getter

同样，对象的类元数据也不会被克隆。

在这个例子中，使用getter会克隆其返回值，但不会克隆getter函数本身（或任何元数据属性）。

```javascript
structuredClone({ get foo() { return 'bar' } })
// Becomes: { foo: 'bar' }
```

### 对象原型

原型链不会被遍历或复制。因此如果你克隆一个`MyClass`类的实例，克隆对象将不再被识别成这个类的实例（但是这个类的有效属性都将被复制）。

```javascript
class MyClass { 
  foo = 'bar' 
  myMethod() { /* ... */ }
}
const myClass = new MyClass()

const cloned = structuredClone(myClass)
// Becomes: { foo: 'bar' }

cloned instanceof myClass // false
```

## 所有支持类型的列表

[JS Built-ins](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types)

`Array`, `ArrayBuffer`, `Boolean`, `DataView`, `Date`, `Error` types (those specifically listed below), `Map` , `Object` but only plain objects (e.g. from object literals), [Primitive types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#primitive_values), except `symbol` (aka `number`, `string`, `null`, `undefined`, `boolean`, `BigInt`), `RegExp`, `Set`, `TypedArray`

Error types

`Error`, `EvalError`, `RangeError`, `ReferenceError` , `SyntaxError`, `TypeError`, `URIError`

[Web/API types](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#webapi_types)

`AudioData`, `Blob`, `CryptoKey`, `DOMException`, `DOMMatrix`, `DOMMatrixReadOnly`, `DOMPoint`, `DomQuad`, `DomRect`, `File`, `FileList`, `FileSystemDirectoryHandle`, `FileSystemFileHandle`, `FileSystemHandle`, `ImageBitmap`, `ImageData`, `RTCCertificate`, `VideoFrame`

## 浏览器与运行时支持

并且这是最棒的一点——`structredClone`被所有主流浏览器甚至Node.js和Deno所支持。

如图：

![assets_YJIGb4i01jvw0SRdL5Bt_1fdbc5b0826240e487a4980dfee69661](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202407070141821.webp)
