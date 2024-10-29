---
date: 2024-10-15
tags: [Web, 译文]
---

> https://jakelazaroff.com/words/web-components-eliminate-javascript-framework-lock-in/

最近，我们见了许多很棒的博文讨论`Web Components`。它们多聚焦在飞速增长的 `HTML web components` 模式——尽量避免使用 Shadow Dom，而使用现存的 markup。也有人讨论过，包括当前这片博文——是否用 `Web Components`完全的替换 JavaScript 框架。

然而，这并非唯一的选项。你当然也可以配合 JavaScript 框架使用 `web components` 。但对此我想说一个此前从未有任何人提到的关键利好：**web components 可以显著减少 JavaScript 框架之间的耦合。**

为了证明它，我们将做点疯狂的事：创建一个 app，但其中每一个组件都用一个不同的框架编写。

也许你会说：你不应该这样构建一个真实的 app！但是，这是有正当理由去混合框架的。也许你正在逐渐从 React 迁移至 Vue；也许你的 app 使用 Solid 构建，但你却想使用一个仅存在于 Angular 上的第三方库中的组件；也许你只是想在一个静态网页上的部分“互动孤岛”上使用 Svelte。

这便是我们将要创建的：一个松散基于 TODOMVC 的小 todo 程序。

当我们构建它的时候，我们将看到 web components 是如何隔离 JavaScript 框架，允许我们使用它却不会对应用程序的其余部分产生“更广泛的限制”。

# 什么是 web components ？

以防你不熟悉 web components ，这里是对它如何工作的简要介绍。

首先，声明一个 HTMLElement 的子类，让我们叫它 `MyComponent` ：

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <p>Hello from a web component!</p>
      <style>
        p {
          color: pink;
          font-weight: bold;
          padding: 1rem;
          border: 4px solid pink;
        }
      </style>

    `;
  }
}
```

在构造函数中调用 `attachShadow` 让我们的组件使用 shadow DOM，将其与页面其他部分的标记和样式隔离开来。`connectedCallback` 将在组件实际的被链接到 DOM 树时候被调用，将内容渲染至组件的“shadow root”。

这预示着我们将让我们的框架与 web components 一同工作（原文此处玩了一个文字梗）。我们通常会让框架挂载于某个 DOM 元素上（比如#app），并让框架接管此元素的所有后代元素。在使用 web components 的时候，我们可以让框架挂载到 shadow root 上，并确保它只能访问组件的”shadow tree“。

下一步，我们为`MyComponent`类自定义一个组件名：

```javascript
customElements.define("my-component", MyComponent);
```

每当页面上出现此名称的标签时，实际上都是这个类的实例！

```html
<my-component></my-component>
<script>
  const myComponent = document.querySelector("my-component");
  console.log(myComponent instanceof MyComponent); // true
</script>
```

以上内容不多，但足以让你理解本文的其他部分。

# 脚手架布局

我们 app 的入口将是一个 React 组件（作者注：技术上来说，我们正在兼容模式下使用 Preact，因为我没弄清如何让 Vite 的 React 预设正常工作，事实证明若尝试在一个代码库中使用四个不同的框架时，构建工具会变成最棘手的那一个！），这里是我们的不起眼的开始：

```jsx
// TodoApp.jsx
export default function TodoApp() {
  return <></>;
}
```

我们可以增加元素来代替这个基础的 DOM 结构，但我想要编写另外一个组件，以展示我们可以用嵌套 web Component 的方式嵌套 JavaScript 框架。

大多数框架都支持组合，就像是普通的 HTML 元素。从外部看来，它实际上看起来像这样：

```html
<Card>
  <Avatar />
</Card>
```

在内部，有框架好几种方法去处理它。举个例子，React 和 Solid 允许通过特殊的 `children`参数访问子元素。

```tsx
function Card(props) {
  return <div class="card">{props.children}</div>;
}
```

使用 Shadow DOM 的 web components，我们可以用 `<slot>`元素做到同样的事。当浏览器遇到 `<slot>`元素，会将它替换成 web components 的子元素。

`<slot>`实际上比 React 和 Solid 的 `children`更为强大。如果你给每一个 `<slot>`元素一个 name 标签，一个 web components 就会拥有复数的 `<slot>` ，并且我们可以通过匹配 `<slot>`的名称决定每个嵌套元素的位置。

让我们看看在实践中它的样子，我们将使用 Solid 编写一个组件：

```jsx
// TodoLayout.jsx
import { render } from "solid-js/web";

function TodoLayout() {
  return (
    <div class="wrapper">
      <header class="header">
        <slot name="title" />
        <slot name="filters" />
      </header>
      <div>
        <slot name="todos" />
      </div>
      <footer>
        <slot name="input" />
      </footer>
    </div>
  );
}

customElements.define(
  "todo-layout",
  class extends HTMLElement {
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      render(() => <TodoLayout />, this.shadow);
    }
  }
);
```

这个 Solid web components 有两个部分：上面是实际的组件，下面则是 web component 包装器。

关于 Solid 组件，最重要的部分便是我们使用了具名的`<slot>`组件代替了 `children`参数。然而 Solid 只允许`children`嵌套 Solid 组件，而 slot 是由浏览器自行处理，这可以让我们嵌套任何 HTML 元素——包括其他框架编写的 Web Component 组件。

包装器部分挺像上面那个例子。它在构造器中创造了一个 `shadow root`，并将 Solid 组件渲染在了 connectedCallback 回调里。

请注意：这并非一个 web Component 包装器的完整实现！至少我们还要定义 [`attributeChangedCallback` ](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements#responding_to_attribute_changes) 方法，让我们能在标签变化的时候重新渲染 Solid 组件。如果你正在生产环境里使用它，你大概率应该使用 Solid 提供的一个叫做 Solid Element 的包，它将为你处理一切。

回到 React app，我们现在可以使用 `TodoLayout` 组件：

```tsx
// TodoApp.jsx
export default function TodoApp() {
  return (
    <todo-layout>
      <h1 slot="title">Todos</h1>
    </todo-layout>
  );
}
```

请注意：我们并不需要从 `TodoLayout.jsx` 里引入任何东西——我们只需使用我们自定义的元素 tag。

# 增加代办

对于代办的输入，我们将拨开洋葱，再往后退一步，不使用框架就将它写出来！

```js
// TodoInput.js
customElements.define("todo-input", TodoInput);

class TodoInput extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <form>
        <input name="text" type="text" placeholder="What needs to be done?" />
      </form>
    `;

    this.shadow.querySelector("form").addEventListener("submit", (evt) => {
      evt.preventDefault();
      const data = new FormData(evt.target);

      this.dispatchEvent(new CustomEvent("add", { detail: data.get("text") }));
      evt.target.reset();
    });
  }
}
```

在示例 web component 和 solid 布局之间，你可能会注意到一种模式：附加一个 `shadow root`，并在其中渲染一些 HTML。无论是我们手写的还是框架渲染的，这个流程大同小异。

在此，我们使用了自定义事件与父组件通信。当表单被提交，我们会发送一个 add 事件并附上 input 的内容。

在一个软件系统的组件之间，事件队列经常使用 [decouple communication](https://gameprogrammingpatterns.com/event-queue.html) （解耦通信）。浏览器严重依赖于事件，特别是自定义事件，它是 web Component 工具箱中的重要工具。

在我们继续增加组件之前，我们需要搞清楚如何处理我们的状态。就现在而言，我们只需要保留我们的 React 组件。虽然我们最终会超越 `useState`，但它是一个完美的起点。

每个代办都将有三个属性：`id`、`text`去描述代办内容，还有一个布尔值 `done`来描述它是否被完成。

```tsx
// TodoApp.jsx
import { useCallback, useState } from "react";

let id = 0;
export default function TodoApp() {
  const [todos, setTodos] = useState([]);

  export function addTodo(text) {
    setTodos((todos) => [...todos, { id: id++, text, done: false }]);
  }

  const inputRef = useCallback((ref) => {
    if (!ref) return;
    ref.addEventListener("add", (evt) => addTodo(evt.detail));
  }, []);

  return (
    <todo-layout>
      <h1 slot="title">Todos</h1>
      <todo-input slot="input" ref={inputRef}></todo-input>
    </todo-layout>
  );
}
```

我们将在 React State 中 维护一个代办任务数组。当代办增加的时候，加入数组之内。

有一个比较尴尬的部分是 inputRef 函数。我们的 `<todo-input>` 将在表单提交的时候发送一个自定义 add 事件。通常在 React 中，我们会使用类似于 onClick 的传参挂载事件监听器——但是那只适用于 React 已经知道的事件，我们需要直接监听 add 事件。

在 React 部分，将直接使用 ref 与 DOM 交互。最常使用的是 ref 钩子，但并非唯一的方法。ref 参数实际上只是一个会将 DOM 节点回调的函数。我们可以将一个事件监听器直接附在 DOM 节点的函数上。

你也许好奇为什么要使用 useCallback 包裹具体函数，请看 React 文档：

> If the `ref` callback is defined as an inline function, it will get called twice during updates, first with `null` and then again with the DOM element. This is because a new instance of the function is created with each render, so React needs to clear the old ref and set up the new one. You can avoid this by defining the `ref` callback as a bound method on the class, but note that it shouldn’t matter in most cases.

在此例子中，他确实重要。因为我们不想在每一次重新渲染的时候都挂载一次事件监听器。因此将其包裹，确保每次都传递同样的 ref。

# 代办条目

到此为止，我们可以增加代办，但还没法儿看见它们。所以下一步则是编写一个组件去展示每一个代办条目。我们将使用 Svelte 编写它。

Svelte 支持在盒子外自定义元素（我没太理解这个是指什么，也许可以参考 [out of the box](https://svelte.dev/docs/custom-elements-api)）。相比起继续在每次展示同样的 web component 包装器，不如使用这个特性。

这里是代码：

```svelte
<!-- TodoItem.svelte -->
<svelte:options customElement="todo-item" />

<script>
  import { createEventDispatcher } from "svelte";

  export let id;
  export let text;
  export let done;

  const dispatch = createEventDispatcher();
  $: dispatch("check", { id, done });
</script>

<div>
   <input id="todo-{id}" type="checkbox" bind:checked={done} />
  <label for="todo-{id}">{text}</label>
  <button aria-label="delete {text}" on:click={() => dispatch("delete", { id })}>
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <path
        d="M10.707,1.293a1,1,0,0,0-1.414,0L6,4.586,2.707,1.293A1,1,0,0,0,1.293,2.707L4.586,6,1.293,9.293a1,1,0,1,0,1.414,1.414L6,7.414l3.293,3.293a1,1,0,0,0,1.414-1.414L7.414,6l3.293-3.293A1,1,0,0,0,10.707,1.293Z"
        fill="currentColor"
      />
    </svg>
  </button>
</div>
```

在 Svelte 中， `<script>`标签并非直接渲染到 DOM 上——相反，这部分代码将在组件实例化的时候运行。我们的 Svelte 组件接受三个传参： `id`、 `text`、和 `done`。它同样创建了一个自定义事件发送器，让我们可以在这个组件上发送事件。

这个`$:` 语法声明了一个响应式语句块。它意味着无论 `id`、 `text`、还是`done`的值变化时，它将发送一个带有新值的 `check` 事件。虽然 id 估计不会变化，但这意味着在实际情况中，当我们 check 或者 uncheck 代办，它都会发送 check 事件。

回到 React 组件，我们遍历我们的代办数组并且使用 `<todo-item>` 组件。我们同时需要更多的工具函数去删除和 check 待办项，并且还需要在每一个 `<todo-item>` 上增加一个事件监听的回调。

这里是代码：

```tsx
// TodoApp.jsx
import { useCallback, useState } from "react";

let id = 0;
export default function TodoApp() {
  const [todos, setTodos] = useState([]);

  export function addTodo(text) {
    setTodos((todos) => [...todos, { id: id++, text, done: false }]);
  }

  export function removeTodo(id) {
    setTodos((todos) => todos.filter((todo) => todo.id !== id));
  }

  export function checkTodo(id, done) {
    setTodos((todos) => todos.map((todo) => (todo.id === id ? { ...todo, done } : todo)));
  }

  const inputRef = useCallback((ref) => {
    if (!ref) return;
    ref.addEventListener("add", (evt) => addTodo(evt.detail));
  }, []);

  const todoRef = useCallback((ref) => {
    if (!ref) return;
    ref.addEventListener("check", (evt) => checkTodo(evt.detail.id, evt.detail.done));
    ref.addEventListener("delete", (evt) => removeTodo(evt.detail.id));
  }, []);

  return (
    <todo-layout>
      <h1 slot="title">Todos</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <todo-item ref={todoRef} {...todo} />
          </li>
        ))}
      </ul>
      <todo-input slot="input" ref={inputRef}></todo-input>
    </todo-layout>
  );
}
```

# 筛选代办

还剩最后一个功能需要添加到应用中，那便是筛选代办的能力。

在我们完成此功能之前，我们需要重构部分代码。

我想展示另外一种方法让不同的 web component 之间互相沟通：使用一个共享的状态管理。许多框架各自都有状态管理的实现，但是我们需要一个让他们互相通用的状态管理。因此，我们将使用一个叫做 [Nano Stores](https://github.com/nanostores/nanostores) 的库。

第一步，我们将创建一个新的文件名为 `store.js` ，使用 Nano Store 管理我们的代办状态。

```js
// store.js
import { atom, computed } from "nanostores";

let id = 0;
export const $todos = atom([]);
export const $done = computed($todos, (todos) => todos.filter((todo) => todo.done));
export const $left = computed($todos, (todos) => todos.filter((todo) => !todo.done));

export function addTodo(text) {
  $todos.set([...$todos.get(), { id: id++, text }]);
}

export function checkTodo(id, done) {
  $todos.set($todos.get().map((todo) => (todo.id === id ? { ...todo, done } : todo)));
}

export function removeTodo(id) {
  $todos.set($todos.get().filter((todo) => todo.id !== id));
}

export const $filter = atom("all");
```

这部分代码逻辑相同，最大改变只是从 `useState` API 转为了 Nano Store 的 API。我们新增了两个计算状态管理， `$done` 和 `$left`,它们是从 `$todo`中派生出来的，各自返回已完成和未完成的任务。我们也添加了一个新的状态管理 `$filter` 用于保留当前的过滤值。

我们将用 Vue 完成过滤组件。

```vue
<!-- TodoFilters.ce.vue -->
<script setup>
import { useStore, useVModel } from "@nanostores/vue";

import { $todos, $done, $left, $filter } from "./store.js";

const filter = useVModel($filter);
const todos = useStore($todos);
const done = useStore($done);
const left = useStore($left);
</script>

<template>
  <div>
    <label>
      <input type="radio" name="filter" value="all" v-model="filter" />
      <span> All ({{ todos.length }})</span>
    </label>
    <label>
      <input type="radio" name="filter" value="todo" v-model="filter" />
      <span> Todo ({{ left.length }})</span>
    </label>

    <label>
      <input type="radio" name="filter" value="done" v-model="filter" />
      <span> Done ({{ done.length }})</span>
    </label>
  </div>
</template>
```

它的语法与 Svelte 颇为相似， `<script>` 标签位于顶部，并且在组件实例化的时候运行。同时`<template>`标签包含组件的标记。

Vue 并不像是 Svelte 那样简单的将组件编译成自定义组件，因此我们需要创建另一个文件，引入 Vue 提供的 [`defineCustomElement`](https://vuejs.org/guide/extras/web-components.html) 将其转为自定义组件。

```js
// TodoFilters.js
import { defineCustomElement } from "vue";

import TodoFilters from "./TodoFilters.ce.vue";

customElements.define("todo-filters", defineCustomElement(TodoFilters));
```

回到 React 部分，我们将使用 Nano Store 重构我们的组件。并且加入 `<todo-filters>`组件。

```tsx
// TodoApp.jsx
import { useStore } from "@nanostores/react";
import { useCallback } from "react";

import { $todos, $done, $left, $filter, addTodo, removeTodo, checkTodo } from "./store.js";

export default function App() {
  const filter = useStore($filter);
  const todos = useStore($todos);
  const done = useStore($done);
  const left = useStore($left);
  const visible = filter === "todo" ? left : filter === "done" ? done : todos;

  const todoRef = useCallback((ref) => {
    if (!ref) return;
    ref.addEventListener("check", (evt) => checkTodo(evt.detail.id, evt.detail.done));
    ref.addEventListener("delete", (evt) => removeTodo(evt.detail.id));
  }, []);

  const inputRef = useCallback((ref) => {
    if (ref) ref.addEventListener("add", (evt) => addTodo(evt.detail));
  }, []);

  return (
    <todo-layout>
      <h1 slot="title">Todos</h1>
      <todo-filters slot="filters" />

      <div slot="todos">
        {visible.map((todo) => (
          <todo-item key={todo.id} ref={todoRef} {...todo} />
        ))}
      </div>
      <todo-input ref={inputRef} slot="input" />
    </todo-layout>
  );
}
```

我们完成了！我们现在有一个完全函数化的 todo 应用，并且用四个不同的框架完成——React、Solid、Svelte 和 Vue——还有一个用纯 JavaScript 的组件。

# 更进一步

本文并非旨在说服你这是编写网页应用的好方法。它只是展示除了使用单个框架编写整个网页应用，还有很多方法去完成这一人物——实际上，web component 让它更容易做到这一点。

你可以渐进式的增加静态 HTML。你可以构建一个富交互的 JavaScript“岛屿”，让其可以自然的与其他的超媒体库沟通，比如 htmx。你甚至可以用 JavaScript 框架包裹 web component 并且在任意的其他框架里使用它。

Web components 通过提供任何框架都可以使用的公共接口，极大的放松了 JavaScript 框架之间的耦合。从消费者的角度来看，web component 只是 HTML 标签——底层用了什么并不重要。

# Reading List

If you’re interested, here are some good articles that dive even deeper into the topic:

- Chris Ferdinandi wrote about wrapping his own UI library [Reef](https://reefjs.com) with a web component in [Reactive Web Components and DOM Diffing](https://gomakethings.com/reactive-web-components-and-dom-diffing/).
- Andrico Karoulla wrote a great overview of how to write framework-agnostic components aptly titled [Writing Components That Work in Any Framework](https://component-odyssey.com/articles/01-writing-components-that-work-in-any-framework).
- Thomas Wilburn showed how to use web components to build “languages” within HTML in [Chiaroscuro, or Expressive Trees in Web Components](https://www.milezero.org/index.php/tech/web/components/chiaroscuro.html).
- Maxi Ferreira wrote a wonderful article called [Sharing State with Islands Architecture](https://frontendatscale.com/blog/islands-architecture-state/) that goes into detail more about custom events and stores.
- The official Astro documentation has a page on [sharing state between islands](https://docs.astro.build/en/core-concepts/sharing-state/) using [Nano Stores](https://github.com/nanostores/nanostores).
- Although it doesn’t explicitly mention web components, the htmx essay on [hypermedia-friendly scripting](https://htmx.org/essays/hypermedia-friendly-scripting/) brings up events and islands as ways for client-side scripting to interact with hypermedia-driven web applications.
