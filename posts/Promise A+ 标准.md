---

date: 2023-07-26
tags: [JavaScript,译文]
---

引用部分为原文, 括弧内为译者注

> 原文：https://promisesaplus.com/

------
>**An open standard for sound, interoperable JavaScript promises—by implementers, for implementers.**

一份开放的标准，为了能在不同JavaScript promises实现之间稳定地交互——从实现者中来，到实现者里去。

> A *promise* represents the eventual result of an asynchronous operation. The primary way of interacting with a promise is through its `then` method, which registers callbacks to receive either a promise’s eventual value or the reason why the promise cannot be fulfilled.
> 
> This specification details the behavior of the `then` method, providing an interoperable base which all Promises/A+ conformant promise implementations can be depended on to provide. As such, the specification should be considered very stable. Although the Promises/A+ organization may occasionally revise this specification with minor backward-compatible changes to address newly-discovered corner cases, we will integrate large or backward-incompatible changes only after careful consideration, discussion, and testing.
> 
> Historically, Promises/A+ clarifies the behavioral clauses of the earlier [Promises/A proposal](http://wiki.commonjs.org/wiki/Promises/A), extending it to cover *de facto* behaviors and omitting parts that are underspecified or problematic.
> 
> Finally, the core Promises/A+ specification does not deal with how to create, fulfill, or reject promises, choosing instead to focus on providing an interoperable `then` method. Future work in companion specifications may touch on these subjects.

*promise*表现为异步操作的最后结果。其主要的交互方式便是通过*promise*的`then`方法注册回调函数去接收promise的最终值或是promise为何无法“fulfilled”的原因。

这份规范详细描述了`then`方法的行为，并提供了一个交互的基础：所有基于Promises/A+规范实现的promise都可以依赖这个基础来提供。 *（以确保它们在使用then方法时都表现一致）* 尽管Promises/A+组织偶尔会修正这份规范，去兼容那些新发现的边缘情况（角落案例），但我们只会在经过仔细考虑、讨论和测试之后才会发布那些大的或者向后不兼容的改变。

从历史上来说，Promises/A+比起早期的Promises/A规范明确了行为条款，将其扩展并覆盖了实际行为，省略了一些未说明和存在问题的部分。

最后，Promises/A+规范的核心并非处理**如何创建、完成或拒绝promises**，而是聚焦于如何提供一个具有交互性的 `then` 方法。可能未来会在相关规范中涉及这些主题。

## Terminology - 术语

> 1. “promise” is an object or function with a `then` method whose behavior conforms to this specification.
> 2. “thenable” is an object or function that defines a `then` method.
> 3. “value” is any legal JavaScript value (including `undefined`, a thenable, or a promise).
> 4. “exception” is a value that is thrown using the `throw` statement.
> 5. “reason” is a value that indicates why a promise was rejected.

1. "promise"："promise"是指一个具有`then`方法且其行为符合此规范的对象或函数。
2. "thenable"："thenable"是指一个具有`then`方法的对象或函数。
3. "value"："value"指的是任何合法的JavaScript值（包括`undefined`、一个"thenable"对象或一个Promise对象）。
4. "exception"："exception"是指使用`throw`语句抛出的值。
5. "reason"："reason"是指指示为什么一个Promise被拒绝的值。

## Requirements - 规定

### Promise States - Promise 状态

> A promise must be in one of three states: pending, fulfilled, or rejected.
> 
> - When pending, a promise:
>
>    1. may transition to either the fulfilled or rejected state.
>
> - When fulfilled, a promise:
>
>    1. must not transition to any other state.
>    2. must have a value, which must not change.
>
> - When rejected, a promise:
>
>    1. must not transition to any other state.
>    2. must have a reason, which must not change.
> 
> Here, “must not change” means immutable identity (i.e. `===`), but does not imply deep immutability.

一个promise必须具有以下三种状态之一：等待（pending）, 完成（fulfilled）, 拒绝（rejected）.

- **等待**状态时

    1. 可以变换为完成或拒绝状态

- **完成**状态时

    1. 不可以变换为其他状态
    2. 必须有一个不会改变的值

- **拒绝**状态时

    1. 不可以变换为其他状态
    2. 必须有一个不会改变的原因

在这里的"不会改变"指的是不可变性（严格相等）,不过并不意味着深层不可变性（嵌套）。


### The `then` Method - `then`方法

> A promise must provide a `then` method to access its current or eventual value or reason.
> Here, “must not change” means immutable identity (i.e. `===`), but does not imply deep immutability.
> 
> 1. Both`onFulfilled`and`onRejected`are optional arguments:
> 
>    1. If `onFulfilled` is not a function, it must be ignored.
>    2. If `onRejected` is not a function, it must be ignored.
> 2. If`onFulfilled`is a function:
>    1. it must be called after `promise` is fulfilled, with `promise`’s value as its first argument.
>    2. it must not be called before `promise` is fulfilled.
>    3. it must not be called more than once.
> 3. If`onRejected`is a function,
> 
>    1. it must be called after `promise` is rejected, with `promise`’s reason as its first argument.
>    2. it must not be called before `promise` is rejected.
>    3. it must not be called more than once.
> 4. `onFulfilled` or `onRejected` must not be called until the [execution context](https://es5.github.io/#x10.3) stack contains only platform code. [[3.1](https://promisesaplus.com/#notes)].
> 5. `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value). [[3.2](https://promisesaplus.com/#notes)]
> 6. `then`may be called multiple times on the same promise.
>    1. If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the order of their originating calls to `then`.
>   2. If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the order of their originating calls to `then`.
> 7. `then` must return a promise`promise2 = promise1.then(onFulfilled, onRejected);`
>    1. If either `onFulfilled` or `onRejected` returns a value `x`, run the Promise Resolution Procedure `[[Resolve]](promise2, x)`.
>    2. If either `onFulfilled` or `onRejected` throws an exception `e`, `promise2` must be rejected with `e` as the reason.
>    3. If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled with the same value as `promise1`.
>    4. If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with the same reason as `promise1`.

一个Promise对象必须提供一个then方法，用于访问它的当前值或最终的值（fulfillment）或拒绝的原因（rejection）。

一个promise的`then`方法需要接受两个参数：`promise.then(onFulfilled, onRejected)`

1. `onFulfilled`和`onRejected`都是可选参数

	1. 如果`onFulfilled`不是函数，必须被忽略
	2. 如果`onRejected`不是函数，必须被忽略

2. 如果`onFulfilled`是函数:

	1. 它必须在`promise`完成之后被调用,`promise`的value将成为它的第一个参数。
	2. 它不能在`promise`完成之前被调用。
	3. 它不能被调用超过一次。

3. 如果`onRejected`是函数:

	1. 它必须在`promise`拒绝之后被调用,`promise`的reason将成为它的第一个参数。
	2. 它不能在`promise`拒绝之前被调用。
	3. 它不能被调用超过一次。

4. `onFulfilled` or `onRejected` 回调函数必须在执行上下文栈（execution context stack）中只包含平台代码（platform code）时才能被调用。

*(在JavaScript中，执行上下文栈是一个用于管理函数调用和代码执行的机制。当一个函数被调用时，它的执行上下文会被推入栈中，当函数执行完成后，执行上下文会从栈中弹出。平台代码指的是JavaScript运行环境（如浏览器或Node.js）提供的内置函数、方法或事件处理程序等，而不是由开发者编写的自定义代码。这意味着在执行Promise的回调函数之前，所有正在进行的自定义代码执行已经完成，避免了回调函数执行过程中可能出现的意外行为或状态混乱。)*

`onFulfilled` 与 `onRejected` 必须被作为函数调用 (即没有 `this` 值). 

6. `then`可以在同一个`promise`上被多次调用.
	1. 如果`promise`完成，所有对应的onFulfilled回调函数必须按照它们调用then的顺序依次执行。
	2. 如果`promise`拒绝，所有对应的onRejected回调函数必须按照它们调用then的顺序依次执行。

7. `then`必须返回一个promise`promise2 = promise1.then(onFulfilled, onRejected);`
	1. 如果 `onFulfilled` 或 `onRejected`返回一个值`x`,则需要运行Promise Resolution Procedure（Promise解决过程）
	2. 如果`onFulfilled` 或 `onRejected`抛出一个异常e,`promise2`必须以e为reason拒绝。
	3. 如果 `onFulfilled` 不是函数并且`promise1`完成， `promise2` 必须也完成并与 `promise1`使用同样的value.
	4. 如果 `onRejected` 不是函数并且`promise1`拒绝， `promise2` 必须也决绝并与 `promise1`使用同样的reason.

### The Promise Resolution Procedure - Promise解决过程

> The **promise resolution procedure** is an abstract operation taking as input a promise and a value, which we denote as `[[Resolve]](promise, x)`. If `x` is a thenable, it attempts to make `promise` adopt the state of `x`, under the assumption that `x` behaves at least somewhat like a promise. Otherwise, it fulfills `promise` with the value `x`.
> This treatment of thenables allows promise implementations to interoperate, as long as they expose a Promises/A+-compliant `then` method. It also allows Promises/A+ implementations to “assimilate” nonconformant implementations with reasonable `then` methods.
> To run `[[Resolve]](promise, x)`, perform the following steps:
> 1. If `promise` and `x` refer to the same object, reject `promise` with a `TypeError` as the reason.
> 2. If`x`is a promise, adopt its state [3.4]:
>    1. If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.
>    2. If/when `x` is fulfilled, fulfill `promise` with the same value.
>    3. If/when `x` is rejected, reject `promise` with the same reason.
> 3. Otherwise, if`x`is an object or function,
>	1. Let `then` be `x.then`. [[3.5](https://promisesaplus.com/#notes)]
>	2. If retrieving the property `x.then` results in a thrown exception `e`, reject `promise` with `e` as the reason.
>	3. If`then`is a function, call it with`x`as`this`, first argument`resolvePromise`, and second argument`rejectPromise`, where:
>		1. If/when `resolvePromise` is called with a value `y`, run `[[Resolve]](promise, y)`.
>		2. If/when `rejectPromise` is called with a reason `r`, reject `promise` with `r`.
>		3. If both `resolvePromise` and `rejectPromise` are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
>		4. If calling`then`throws an exception`e`,
>			1. If `resolvePromise` or `rejectPromise` have been called, ignore it.
>			2. Otherwise, reject `promise` with `e` as the reason.
>   4. If `then` is not a function, fulfill `promise` with `x`.
>4. If `x` is not an object or function, fulfill `promise` with `x`.
> If a promise is resolved with a thenable that participates in a circular thenable chain, such that the recursive nature of `[[Resolve]](promise, thenable)` eventually causes `[[Resolve]](promise, thenable)` to be called again, following the above algorithm will lead to infinite recursion. Implementations are encouraged, but not required, to detect such recursion and reject `promise` with an informative `TypeError` as the reason. [[3.6](https://promisesaplus.com/#notes)]

**Promise解决过程**是一个抽象操作,它接受一个Promise和一个值作为输入，表示为`[[Resolve]](promise, x)`。如果`x`是一个"thenable"(具有then方法/可以被链式调用的),它试图让`promise`采用`x`的状态, 除非`x`的行为至少在某种程度上像是一个promise.否则,它将完成`promise`,并且让x成为这个`promise`的 value .

"`thenables`"处理方案允许不同`promise`实现 相互操作,只要他们都暴露遵循Promises/A+的`then`方法, 它也允许 Promises/A+ 实现“吸收”不符合规范但具有合理then方法的实现。

为了运行`[[Resolve]](promise, x)`, 进行以下步骤:

1. 如果`promise`与`x`提交了同一个对象, 以`TypeError` 为`reason`拒绝`promise`.

2. 如果`x`是一个`promise`, 则采用`x`的状态.
	1. 如果`x`为等待态, `promise`必须等待到`x`完成或拒绝.
	2. 如果/当`x`完成, 以相同的value完成`promise`.
	3. 如果/当`x`拒绝, 以相同的reason拒绝`promise`

3. 另一种可能, 如果`x`是对象或者函数,
	1.  让 `then` 变为 `x.then`.
	2.  如果检索`x.then`属性(property) 结果抛出了一个异常`e`, 则用`e`作为reason拒绝`promise`
	3.  如果`then`是一个函数, 则调用它并以`x`作为`this` , 第一个参数为`resolvePromise`, 第二个参数为`rejectPromise`.
		1. 如果/当 `resolvePromise` 以`y`为`value`被调用, 则运行 `[[Resolve]](promise, y)`.
		2. 如果/当 `rejectPromise`以 `r`为`reason`被调用, 以`r`拒绝 `promise` .
		3. 如果/当 `resolvePromise` 和 `rejectPromise`都被调用, 或者对同一个参数进行了多次调用，那么第一次调用将优先生效，并且后续的调用将被忽略。
		4. 如果调用`then`的过程中抛出异常`e`,
			1. 如果 `resolvePromise` 或者 `rejectPromise` 被调用, 则忽略它(这个异常).
			2. 否则, 以`e`为原因拒绝`promise`
	4. 如果`then`不是函数, 以`x`完成`promise`.
4. 如果`x`不是函数或者对象, 以`x`完成`promise`.

如果一个`promise` 被解决为一个`thenable`，并且这个`thenable`参与了一个循环`thenable`链，导致`[[Resolve]](promise, thenable)`在递归过程中再次被调用，按照上述算法可能会导致无限递归。为了避免这种情况，Promises/A+规范鼓励但不强制要求实现检测到这样的递归，并用一个带有信息的`TypeError`作为原因来拒绝`promise`。

## Notes - 注释

>1. Here “platform code” means engine, environment, and promise implementation code. In practice, this requirement ensures that `onFulfilled` and `onRejected` execute asynchronously, after the event loop turn in which `then` is called, and with a fresh stack. This can be implemented with either a “macro-task” mechanism such as [`setTimeout`](https://html.spec.whatwg.org/multipage/webappapis.html#timers) or [`setImmediate`](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html#processingmodel), or with a “micro-task” mechanism such as [`MutationObserver`](https://dom.spec.whatwg.org/#interface-mutationobserver) or [`process.nextTick`](http://nodejs.org/api/process.html#process_process_nexttick_callback). Since the promise implementation is considered platform code, it may itself contain a task-scheduling queue or “trampoline” in which the handlers are called.
>
>2. That is, in strict mode `this` will be `undefined` inside of them; in sloppy mode, it will be the global object.
>
>3. Implementations may allow `promise2 === promise1`, provided the implementation meets all requirements. Each implementation should document whether it can produce `promise2 === promise1` and under what conditions.
>
>4. Generally, it will only be known that `x` is a true promise if it comes from the current implementation. This clause allows the use of implementation-specific means to adopt the state of known-conformant promises.
>
>5. This procedure of first storing a reference to `x.then`, then testing that reference, and then calling that reference, avoids multiple accesses to the `x.then` property. Such precautions are important for ensuring consistency in the face of an accessor property, whose value could change between retrievals.
>
>6. Implementations should *not* set arbitrary limits on the depth of thenable chains, and assume that beyond that arbitrary limit the recursion will be infinite. Only true cycles should lead to a `TypeError`; if an infinite chain of distinct thenables is encountered, recursing forever is the correct behavior.

1. 这里的"平台代码"意思是引擎/环境/`promise`实现代码。 事实上, 这个要求确保了`onFulfilled` 和 `onRejected`回调异步执行,也就是`then`方法事件循环的下一个循环周期中，并在一个新的执行栈上执行。 这可以通过“宏任务”机制，比如`setTimeout`或`setImmediate`，或者“微任务”机制，比如`MutationObserver`或`process.nextTick`来实现。由于`Promise`实现被视为平台代码，它本身可能包含一个任务调度队列或“跳板(trampoline)”，用于调用处理程序(handlers)。
	*(跳板是一种控制流的技术，用于在执行回调函数时避免出现深度递归调用。由于JavaScript是单线程的，深度递归调用可能导致栈溢出。使用跳板技术，可以将回调函数的执行放入任务队列中，从而保持执行上下文的切换，避免了深度递归调用导致的栈溢出问题。)*
2. 在严格模式（strict mode）下，回调函数（onFulfilled和onRejected）中的this将为undefined；而在非严格模式（sloppy mode，也称为默认模式）下，this将指向全局对象。
3. 实现可以允许` promise2 === promise1`，前提是实现满足所有要求。每个实现都应该记录是否会产生 `promise2 === promise1`，以及在什么条件下会产生这种情况。
4. 实现可以使用实现特定的方式来判断x是否为真正的Promise，并允许在采用已知符合规范的Promise状态时使用实现特定的优化或处理。在使用这个条款时，需要确保实现之间的一致性和兼容性，以确保代码在不同实现中的表现一致。
5. 首先存储对 x.then 的引用，然后测试该引用，最后调用该引用的过程，避免了多次访问 x.then 属性。这样的预防措施对于确保在访问器属性面前的一致性很重要，因为其值可能在多次访问之间发生更改。
6. 实现不应对thenable链的深度设置任意限制，并假设在超过该任意限制后，递归将是无限的。只有真正的循环（cycle）才应该导致 TypeError 错误；如果遇到无限不同的thenables链，递归是正确的行为。



