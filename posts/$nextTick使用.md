---
title: "$nextTick使用"
date: "2022-08-08"
tag: "Vue"
---

# 定义

$nextTick 是Vue提供的工具方法，会在下一个`Tick`中执行回调，在修改数据之后立即使用这个方法，可以获取更新后的 DOM。

Tick是Vue缓存的任务队列，其中内容则是对响应式状态的修改，这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

nextTick() 可以在状态改变后立即使用，以等待 DOM 更新完成。你可以传递一个回调函数作为参数，或者 await 返回的 Promise。

>（在2.10版本后，如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise，你得自己提供 polyfill）



```vue
// 修改数据
vm.msg = 'Hello'
// DOM 还没有更新
Vue.nextTick(function () {
  // DOM 更新了
})

```

# 实现原理

`vue/src/core/util/next-tick.ts`

```typescript
/* globals MutationObserver
* 全局观察者
*/

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

//  noop 表示一个无操作空函数，用作函数默认值，防止传入 undefined 导致报错

export let isUsingMicroTask = false

const callbacks: Array<Function> = []
let pending = false

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// 此处我们拥有异步延迟包装器在使用微任务列表
// In 2.5 we used (macro) tasks (in combination with microtasks).
// 在2.5版本，我们使用宏任务列（结合微任务）
// However, it has subtle problems when state is changed right before repaint
//然而，就在重绘之前的状态改变的时候，它有些微妙的问题。
// (e.g. #6813, out-in transitions).



// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).

// issue 6813 是一个关于v-show的延迟问题，由于next Tick使用micotask实现，而 micotask 执行优先级非常高，
// 在某些场景下它甚至要比事件冒泡还要快，就会导致一些诡异的问题。
// 在6813的版本中，nextTick变成了macro task，导致重绘和动画的场景出现问题。

let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// next Tick 行为利用了可访问的微任务队列
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
//如果支持Promise，我们将使用:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  //生成一个已resolve的Promise
  timerFunc = () => {
    p.then(flushCallbacks)
    //将回调在Promise.then中执行
      
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {
  // Use MutationObserver where native Promise is not available,
  // 如果不支持原生Promise 就使用MutationObserver
  // MutationObserver 接口提供了监视对 DOM 树所做更改的能力。
  // 它被设计为旧的 Mutation Events 功能的替代品，该功能是 DOM3 Events 规范的一部分。
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  // 使用setImmediate，虽然它也是宏任务队列，但仍比setTimeout好些
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}
// 声明合并？
export function nextTick(): Promise<void>
export function nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void
export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void
/**
 * @internal
 */
export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```
