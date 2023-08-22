---
title: "浅谈TypeScript装饰器"
date: "2023-08-01"
tag: "TypeScript"
---



装饰器是一种特殊的语法功能，它允许使用者在类、方法、属性或参数上附加元数据，并以声明性的方式修改它们的行为。装饰器通常用于增强或修改类或其成员的功能，是一种元编程的手段。



在TypeScript中，装饰器采用`@expression`的语法，放置在要修饰的目标前面。`expression`可以是一个函数调用或表达式，它会在运行时被调用，并且接收不同的参数，具体取决于装饰器被放置的位置。



# TypeScript支持四种类型的装饰器

1. 类装饰器（Class Decorators）: 应用于类的构造函数，并可以用来修改类的行为或元数据。类装饰器接收一个构造函数作为唯一参数。
2. 属性装饰器（Property Decorators）: 应用于类的属性定义，并可以用来修改属性的行为或元数据。属性装饰器接收两个参数，分别是类的原型对象和属性名称。
3. 方法装饰器（Method Decorators）: 应用于类的方法定义，并可以用来修改方法的行为或元数据。方法装饰器接收三个参数，分别是类的原型对象、方法名称和方法的属性描述符。
4. 参数装饰器（Parameter Decorators）: 应用于类的方法参数，并可以用来修改参数的行为或元数据。参数装饰器接收三个参数，分别是类的原型对象、方法名称和参数在函数参数列表中的索引。

```typescript
// 类装饰器
function classDecorator(constructor: Function) {
  console.log("Class decorator called");
}

// 方法装饰器
function methodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("Method decorator called");
}

// 属性装饰器
function propertyDecorator(target: any, propertyKey: string) {
  console.log("Property decorator called");
}

// 参数装饰器
function parameterDecorator(target: any, propertyKey: string, parameterIndex: number) {
  console.log("Parameter decorator called");
}

@classDecorator
class ExampleClass {
  @propertyDecorator
  public exampleProperty: string;

  constructor() {}

  @methodDecorator
  public exampleMethod(@parameterDecorator param: string) {
    console.log(param);
  }
}

const exampleInstance = new ExampleClass();
exampleInstance.exampleMethod("Hello, decorators!");

```

装饰器是一项实验性的特性，不同的版本可能会变化。比如在v5.0以上版本中，方法装饰器仅接受originalMethod,  ClassMethodDecoratorContext两个参数，并且this将作为调用时的参数传入，如下：

```typescript
function loggedMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
    const methodName = String(context.name);
    function replacementMethod(this: any, ...args: any[]) {
        console.log(`LOG: Entering method '${methodName}'.`)
        const result = originalMethod.call(this, ...args);
        console.log(`LOG: Exiting method '${methodName}'.`)
        return result;
    }
    return replacementMethod;
}
```
## 入参注入

装饰器在实现时通常会有参数，它们是由JavaScript/TypeScript在运行时自动注入的。

解释器会将参数传递给相应的装饰器函数，以便在装饰器函数中获取并操作它们。这种自动注入的机制使得装饰器可以根据它们所应用的位置来访问和修改目标对象的信息。

# 装饰器之于普通函数

装饰器目前只能在类以及类成员上使用，但实际上在装饰器规范中，装饰器的目标可以是类、方法、属性、方法参数，以及普通函数（即非类相关的函数）。

>Decorators
>
>A Decorator is a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. Decorators use the form @expression, where expression must evaluate to a function that will be called at runtime with information about the decorated declaration.

## 装饰器和单纯的调用函数的区别

装饰器和单纯的调用函数之间有很大的区别，虽然装饰器的语法看起来类似于函数调用，但它们的目的和用法是不同的。

1. 目的和用途：
   - 装饰器的目的是实现元编程（metaprogramming），允许在运行时修改或增强目标对象的行为或元数据。装饰器可以用于类、属性、方法或方法参数等多种目标，提供了一种声明性的方式来修改代码的结构和行为。
   - 单纯的函数调用通常是用于执行特定的功能或操作。它们是普通的函数，不具备元编程的能力，只能执行其定义的代码逻辑。
2. 上下文：
   - 装饰器函数的上下文是目标对象本身（类的构造函数、类的原型对象、方法的原型对象等）。装饰器可以访问和操作目标对象的属性和行为。
   - 单纯的函数调用的上下文取决于它们被调用的位置。如果是全局函数，它们的上下文将是全局作用域；如果是对象方法，它们的上下文将是该对象。
3. 执行时机：
   - 装饰器是在代码加载阶段执行的，即在程序启动时或类被实例化之前。它们可以用来修改类和其成员的定义，并且在运行时会立即生效。
   - 单纯的函数调用是在代码运行阶段执行的，即在程序执行过程中根据代码流程触发。它们在调用时执行其定义的逻辑，但不会修改类或其成员的结构。
4. 装饰器的优势：
   - 装饰器使得代码更加模块化和易于维护。通过将特定功能的代码从主要逻辑中分离出来，可以更好地组织代码和降低耦合度。
   - 装饰器可以带来更高的可重用性，因为您可以将相同的装饰器应用于不同的目标对象，而不必重复编写相同的逻辑。

如果单纯从行为上来看，本质上装饰器是一种特殊的函数调用模式。装饰器通常使用`@`符号作为语法糖，以更简洁的方式应用于目标对象，类似于普通的函数调用。

```typescript
// 装饰器：记录方法执行时间
function logExecutionTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = Date.now();
    const result = originalMethod.apply(this, args);
    const end = Date.now();
    console.log(`Method ${propertyKey} executed in ${end - start} ms`);
    return result;
  };

  return descriptor;
}

class ExampleClass {
  @logExecutionTime
  public exampleMethod(message: string) {
    // 模拟一个耗时操作
    for (let i = 0; i < 1000000000; i++) {}
    console.log(message);
  }
}

const exampleInstance = new ExampleClass();
exampleInstance.exampleMethod("Hello, decorators!");

```

# NestJs里的装饰器

NestJS的源码非常庞大，无法在这里完整展示。

假设我们有一个非常简单的版本的NestJS，包含一个简化的`Controller`类和`Get`装饰器。

首先，我们创建一个`Controller`类，其中包含一个存储路由信息的数据结构和一个装饰器注册路由的方法。

```typescript
class Controller {
  routes = [];

  addRoute(method, path, handler) {
    this.routes.push({ method, path, handler });
  }
}
```

接下来，我们创建一个`Get`装饰器，它会将装饰的方法注册为GET请求的路由处理函数。

```typescript
function Get(path) {
  return function (target, propertyKey, descriptor) {
    const handler = descriptor.value;
    target.addRoute('GET', path, handler);
  };
}
```

然后，我们创建一个控制器类，并在其中使用`@Get()`装饰器来定义路由。

```typescript
class ExampleController extends Controller {
  @Get('/example')
  findAll() {
    return '这是GET /example的响应';
  }
}
```

现在，我们来测试一下。

```typescript
const exampleController = new ExampleController();
console.log(exampleController.routes);
```

输出结果：

```
[ { method: 'GET', path: '/example', handler: [Function: findAll] } ]
```

从输出结果可以看到，装饰器将`findAll()`方法注册为了一个GET请求的路由处理函数，并将其存储在控制器的`routes`数组中。
