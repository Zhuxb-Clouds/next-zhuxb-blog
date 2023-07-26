---
title: "浅谈Promise使用"
date: "2022-03-12"
tag: "JavaScript"
---



Promise是ES6新增的一个专门用于解决**回调地狱**问题的API，一个 `Promise` 对象代表一个在这个 promise 被创建出来时不一定已知的值。

它能够把异步操作最终的成功返回值或者失败原因和相应的处理程序关联起来。 这样使得异步方法可以像同步方法那样返回值：异步方法并不会立即返回最终的值，而是会返回一个 *promise*，以便在未来某个时候把值交给使用者。

# 回调地狱

异步js编程常常会使用回调函数来进行业务逻辑的编写，并且这些回调总是互相嵌套的。然而一旦嵌套的层数多于一个数值，代码的可读性就会变得很差，并且不断向右拓展，这便是回调地狱。

ES6为了解决回调地狱问题，设计了promise专门用于异步编程。

# Promise的三种状态（state）

一个 `Promise` 必然处于以下几种状态之一：

- *待定（pending）*: 初始状态，既没有被兑现，也没有被拒绝。
- *已兑现（fulfilled）*: 意味着操作成功完成。
- *已拒绝（rejected）*: 意味着操作失败。

待定状态的 Promise 对象要么会通过一个值*被兑现（fulfilled）*，要么会通过一个原因（错误）*被拒绝（rejected）*。并且这三种状态的转换是不可逆的，换言之，Promise要么从pending转换为fulfilled，要么从pending转换为rejected。

# Promise.then形成的链式调用

接下来，就到了Promise如何解决回调地狱问题的关键API：`.then`方法了。

当Promise的状态改变，我们用 promise 的 then 方法排列起来的相关处理程序就会被调用。并且这种调用是链式的：因为Promise在then中返回的也是一个promise对象，在then中第一个回调函数的返回值将成为下一个then的第一个回调的入参，而当在第一个回调中抛出错误的时候会进入下一个then的第二个回调。

这代表我们可以不断调用.then方法来执行回调。就像这样：

```javascript
const myPromise =
  (new Promise(myExecutorFunc))
  .then(handleFulfilledA,handleRejectedA)
  .then(handleFulfilledB,handleRejectedB)
  .then(handleFulfilledC,handleRejectedC);

// 或者统一捕获错误

const myPromise =
  (new Promise(myExecutorFunc))
  .then(handleFulfilledA)
  .then(handleFulfilledB)
  .then(handleFulfilledC)
  .catch(handleRejectedAny);
```

# 静态方法

## Promise.all(iterable)

Promise.all()可以传入一个可迭代对象（包括Array、map、set都属于ES6的iterable类型），一般是数个Promise实例，并且返回一个Promise实例。而返回的promise的回调必须等待所有传入的Promise的resolve回调都结束，如果有一个reject，它都会停止执行并立即抛出这个错误。

实例：

```javascript
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
// expected output: Array [3, 42, "foo"]

```

## Promise.allSettled()

Promise.allSettled和Promise.all类似，传入的都是一个Promise对象数组，不过Promise.allSettled()是等到所有promises都已敲定（settled）返回一个promise，该promise在所有promise完成后完成。并带有一个对象数组，每个对象对应每个promise的结果。

## Promise.any(iterable)

接收一个Promise对象的集合，当其中的一个 promise 成功，就返回那个成功的promise的值。（这与Promise.all恰恰相反）

## Promise.race(iterable)

当iterable参数里的任意一个子promise被成功或失败后，父promise马上也会用子promise的成功返回值或失败详情作为参数调用父promise绑定的相应句柄，并返回该promise对象。

**注：可用于限定时间的异步操作**