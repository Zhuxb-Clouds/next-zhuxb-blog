---
title: "《Vue 2 Internal Features from the Ground Up》课程笔记"
date: "2023-03-15"
tag: "Vue"
---

> 本文来自于FrontMaster上的视频课程《Vue 2 Internal Features from the Ground Up》



# 1.响应式

响应性是 Vue的核心特性，用于监听数据，当某个数据发生改变时，数据所涉及的视图将会自动更新。只要状态（即数据）发生改变，系统依赖部分会自动更新。而这种自动更新我们就称之为响应性。在 web应用中，数据的变化如何响应到DOM中，就是Vue解决的问题。

## 1.1 getter和setter

假设我们有个需求，b永远等于a的十倍，如果使用命令式编程，可以很简单实现，可以像下面这样实现，但是当我们把a设置成4时，b还是等于30

```javascript
let a = 3;
let b = a * 10；
console.log(b) // 30
a = 4
console.log(b) // 30
```

很自然的，我们会将b更改为某种函数，使得它可以在a变化的时候重新赋值给b，类似于这样。

```javascript
onAchange(() => {
  b = a * 10
})
```

将它应用在DOM中：

```javascript
onStateChange(() => {
  document.querySelector('.text').textContent = a * 10
})
// 它的抽象形式就是Vue和其他大部分前端框架的本质：响应式+状态 = 视图
onStateChange(() => {
  view = render(state)
})
```

Vue2使用了`Object.defineProperty()`这个API来实现响应式（Even说明是为了向下兼容才使用ES5，此时他就有用Proxy优化的想法了。）

> **`Object.defineProperty()`** 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。

此API其实就是对对象的某个属性的默认方法进行修改，而Vue的工作则是遍历某个需要成为响应式的数据的所有子属性（即是Composition API 中的data返回的那个Object），劫持所有该对象的`set` 、`get`，此处很简单不作过多赘述。

```
function convert (obj) {
  // Object.keys获取对象的所有key值，通过forEach对每个属性进行修改
  Object.keys(obj).forEach(key => {
    // 保存属性初始值
    let internalValue = obj[key]
    Object.defineProperty(obj, key, {
      get () {
        console.log(`getting key "${key}": ${internalValue}`)
        return internalValue
      },
      set (newValue) {
        console.log(`setting key "${key}" to: ${newValue}`)
        internalValue = newValue
      }
    })
  })
}
```

## 1.2 依赖跟踪（订阅发布模式）

对于一个数据（或者状态），它可能被其他多个数据所依赖（比如说Computed内的函数），我们需要收集依赖它的所有状态，当它改变时，通知所有依赖它的状态一起改变。

Vue所做的便是需要实现一个依赖跟踪类`Dep`，类里有一个叫`depend`方法，该方法用于收集依赖项；另外还有一个`notify`方法，该方法用于触发依赖项的执行，也就是说只要在之前使用`dep`方法收集的依赖项，当调用`notfiy`方法时会被触发执行。

```javascript
window.Dep = class Dep {
  constructor () {
    // 订阅任务队列，即是一个Set
    this.subscribers = new Set()
  }
	// 用于注册依赖项
  depend () {
    if (activeUpdate) {
      this.subscribers.add(activeUpdate)
    }
  }
	// 用于发布消息，触发依赖项重新执行
  notify () {
    this.subscribers.forEach(sub => sub())
  }
}

let activeUpdate = null

function autorun (update) {
  const wrappedUpdate = () => {
    activeUpdate = wrappedUpdate
    update()
    activeUpdate = null
  }
  wrappedUpdate()
}
```

## 1.3 实现迷你观察者

通过在getter和setter中调用`depend`方法和`notfiy`方法，就可以实现自动更新数据的目的了，这也是Vue实现自动更新的核心原理。



```JavaScript
class Dep {
  constructor () {
    this.subscribers = new Set()
  }

  depend () {
    if (activeUpdate) {
      this.subscribers.add(activeUpdate)
    }
  }

  notify () {
    this.subscribers.forEach(sub => sub())
  }
}

function observe (obj) {
  Object.keys(obj).forEach(key => {
    let internalValue = obj[key]

    const dep = new Dep()
    Object.defineProperty(obj, key, {
      // 在getter收集依赖项，当触发notify时重新运行
      get () {
        dep.depend()
        return internalValue
      },

      // setter用于调用notify
      set (newVal) {
        const changed = internalValue !== newVal
        internalValue = newVal
        if (changed) {
          dep.notify()
        }
      }
    })
  })
  return obj
}

let activeUpdate = null

function autorun (update) {
  const wrappedUpdate = () => {
    activeUpdate = wrappedUpdate
    update()
    activeUpdate = null
  }
  wrappedUpdate()
}
```

# 2.插件编写

插件本质是一个普通函数，第一个参数是Vue，第二个参数是`options`

插件往往结合`vue.mixin(options)`使用，`mixin`本质上是把重复的代码片段混入到Vue组件中，供组件复用逻辑。但是`vue.mixin`是一个全局api，它会应用到所有实例。比起使用`vue.mixin`更好的办法是使用插件包裹，因为插件会自动删除，而且就算多次调用`Vue.use`应用同一个插件，它会防止重复应用，但是`vue.mixin`就不行了。另外使用`Vue.use`会让代码更好理解，可以清楚知道应用使用了哪些插件。

## 2.1 练习题

**目标：**编写一个插件让Vue组件可接收一个自定义属性"rules"，该选项接收一些验证规则用于验证组件内data数据。

```javascript
const myPlugin = {
  install(Vue) {
    Vue.mixin({
      created() {
        // 获取实例的rules配置项
        const rules = this.$options.rules;
        if (rules) {
          // rules支持多个规则，需要循环
          Object.keys(rules).forEach((key) => {
            const rule = rules[key];
            // 使用watch不断监听值的变化
            this.$watch(key, (newValue) => {
              const valid = rule.validate(newValue);
              if (!valid) {
                console.log(rule.message);
              }
            });
          });
        }
      }
    });
  }
};
Vue.use(myPlugin);
```

开发插件前，最好的办法是从API的使用方式开始设计，一开始考虑别人使用插件的时候怎么使用才方便去设计API，然后组合Vue底层语法实现一个高级插件。



# 3.渲染函数

![image-20200829121317435](https://vue-course-doc.vercel.app/assets/img/image-20200829121317435.f7e0aad9.png)

**预编译：**

在Vue中，渲染系统是组成响应系统的另外一半，Vue的templates实际上是通过渲染函数渲染出来的，如果把模版直接传入Vue实例，那Vue会执行完整的编译，把传入的template编译为浏览器可运行的DOM。

如果使用Vue CLI构建项目，会用到webpack和vue-loader，实际上vue-loader会在构建阶段实现预编译，把模版代码编译为浏览器可直接解析的DOM代码。另外，Vue还提供了用于编译的渲染函数，它类似angular的ALT编译模式，那应用就可以运行未编译版本。

两种编译模式，一种会把编译器打包进去，一个直接把代码预先编译，包含编译器版本经过gzip压缩大概30KB，不包含编译器版本大概20KB，所以预先编译会更好。

**生成DOM：**

经过第一阶段编译为render函数后，render函数实际上是返回虚拟DOM，接着Vue基于虚拟DOM生成真实DOM。

**虚拟DOM更新机制**：

回顾之前讲的`autorun`函数，其实我们可以把生成虚拟DOM的代码放在`autorun`函数里面，因为渲染函数与所有data属性有依赖关系，当属性发生变化那就触发`autorun`函数然后重新生成新的虚拟DOM，新的虚拟DOM和旧的虚拟DOM进行比较，更新差异的节点再生成真实DOM完成视图更新。

## 3.1 虚拟DOM

![Screenshot020-08-219.19.20](https://vue-course-doc.vercel.app/assets/img/Screenshot020-08-219.19.20-8699982.1b4fcb04.png)

**真实DOM：**大家都知道DOM API，例如调用`documnt.createElement`创建一个真实div节点插入到DOM文档流中，这个原生API实际上是通过浏览器引擎实现的，如果我们通过在浏览器打印DOM节点，会发现它包含非常多属性。这也就导致了即使是最简单的DOM元素，创建它的成本也是非常昂贵的。

**虚拟DOM：**在Vue中的虚拟DOM会在每个实例通过this.$createElement返回一个虚拟节点，这个虚拟节点本质上是一个只包含我们所定义内容的抽象化的javascript对象。相比起真实的DOM，它只在乎我们创建时候所需要的内容，因此相比真实DOM它更加Cheap。



### **虚拟DOM和真实的DOM的差异**：

#### 1.资源消耗问题

使用javascript操作真实DOM是非常消耗资源的，虽然很多浏览器做了优化，可一旦数量增多将导致资源消耗过大，甚至影响渲染性能。

#### 2.执行效率问题

如果你要修改一个真实DOM，一般调用`innerHTML`方法，那浏览器会把旧的节点移除再添加新的节点，但是在虚拟DOM中，只需要修改一个对象的属性，再把虚拟DOM渲染到真实DOM上。很多人会误解虚拟DOM比真实DOM速度快，其实虚拟DOM只是把DOM变更的逻辑提取出来，使用javascript计算差异，减少了操作真实DOM的次数，只在最后一次才操作真实DOM，所以如果你的应用有复杂的DOM变更操作，虚拟DOM会比较快。

#### 3.虚拟DOM还有其他好处

其实虚拟DOM还可以应用在其他地方，因为他们只是抽象节点，可以把它编译成其他平台，例如android、ios。市面上利用形同架构模式的应用有React Native，Weeks，Native script，就是利用虚拟DOM的特点实现的。

## 3.2 template和jsx对比

前端社区谈论关于JSX渲染与模板的问题，喜欢模板的人讨厌JSX，喜欢JSX的人讨厌模板；其实我认为他们并没有什么区别，他们的本质都是声明DOM与状态的关系。

**模版的优势**：模版是一种更静态更具有约束的表现形态，它可以避免发明新语法，任何可以解析HTML的引擎都可以使用它，迁移成本更低；另外最重要的是静态模版可以在编译进行比较多的优化，而动态语言就没法实现了。

**jsx的优势**：更灵活，任何的js代码都可以放在jsx中执行实现你想要的效果，但是也由于他的灵活性导致在编译阶段优化比较困难，只能通过开发者自己优化。

Vue吸收了两者的优点，提供了两种渲染模式，Vue把template作为默认的编译模式，如果你需要构建更灵活的应用，完全可以使用render function实现。

### Render Function API

![Screenshot2020-08-3022.59.03](https://vue-course-doc.vercel.app/assets/img/Screenshot2020-08-3022.59.03.ad3ec34a.png)

上图是调用一个渲染函数例子，`render`函数接收一个参数`h`， `h`只是一种约定的简写表示超脚本（HyperScript），他没有什么特殊意义，只是就像超文本我们叫HTML一样，只是方便书写的表示形式而已。

`h`函数接受三个参数，第一个是元素类型；第二是参数对象例如表示元素的attr属性，DOM属性之类的；第三个属性表示一些子节点，你可以调用h函数生成更多子节点。



## 3.3 Render 练习

我需要编写一个组件，组件根据`tags`属性在页面上输入相应的HTML标签，如果使用模板技术实现，会让代码变得臃肿，需要通过`if`语句判断不同标签。所以这里可以利用渲染函数来实现，下面是具体实现代码。

```html
<div id="demo_4_5">
    <example :tags="['h1', 'h2', 'h3']"></example>
</div>
```

```javascript
Vue.component('example', {
    props: ['tags'],
    render(h) {
		// 第二参数是可选参数，可接受vnodes类型的数组，数组可以是数字和字符串
        return h('div', this.tags.map((tag, i) => h(tag, i)))
    }
})
new Vue({ el: '#demo_4_5' })
```

## 3.4 函数组件和状态组件

函数组件就是不包含state和props的组件，就像它的名字一样，你可以理解为他就是一个函数，在Vue中声明一个函数组件代码如下：

```javascript
const foo = {
	functional: true,
    render: h => h('div', 'foo')
}
```

函数组件特点：

1. 组件不支持实例化。
2. 优化更优，因为在Vue中它的渲染函数比父级组件更早被调用，但是他并不会占用很多资源，因为它没有保存数据和属性，所以它常用于优化一个有很多节点的组件。
3. 容易扩展，如果你的组件只是用来接收 prop然后显示数据，或者一个没有状态的按钮，建议使用函数组件。
4. 函数组件没有this，获取prop可以通过render函数的第二参数得到`render(h, context)`

```javascript
Vue.component('example', {
        functional: true, // 声明是函数组件
        // 因为函数组件没有this,可以通过render第二参数获取相关信息
        render(h, { props: { tags } }) {
            // context.slots() 通过slots方法获取子节点
            // context.children 获取子组件
            // context.parent 父组件，因为函数组件实挂载到根节点上，也就是<div id="app"></div>
            // context.props 组件属性，这里得到tags属性
            // return h('div', this.tags.map((tag, i) => h(tag, i)))
            // 通过函数组件实现标签动态渲染
            return h('div', tags.map((tag, i) => h(tag, i)))
        }
    })
```

```javascript
const Foo = {
    render(h) {
        return h('div', 'foo')
    }
}

const Bar = {
    render(h) {
        return h('div', 'bar')
    }
}
Vue.component('example', {
    props: ['ok'],
    render(h) {
        return h(this.ok ? Foo : Bar)
    }
})
new Vue({ el: '#demo_4_6', data: { ok: true } })
```

## 3.5 整合渲染函数和响应系统

![Screenshot2020-08-2922.50.01](https://vue-course-doc.vercel.app/assets/img/Screenshot2020-08-2922.50.01.8443bb85.png)

上图是Vue的响应性系统和渲染系统的运行流程，可以看到每个组件有自己的渲染函数，这个渲染函数实际上是运行在我们之前封装的`autorun`函数中的，组件开始渲染时会把属性收集到依赖项中，当调用属性的setter方法，会触发`watcher`执行重新渲染，因为渲染函数放在`autorun`函数中，所以每当data数据发生变化，就会重新渲染。

每个组件都有自己独立的循环渲染系统，组件只负责自己的依赖项，这一特性对于你拥有大型组件树时是一个优势，你的数据可以在任何地方改变，因为系统知道数据与组件的对应关系，不会造成过度渲染问题，这一架构优势可以让我们摆脱一些优化工作。

# 4.高阶函数

高阶函数在函数式编程中经常出现，就是你原本有一个函数，你可以通过另外一个函数进行包裹，这个新的函数既具有原来函数的功能，又可以添加自己的功能，这种方式成为高阶函数，听起来会比较抽象。

看看下面的案例：

我们希望在页面上显示用户头像，看到`Avatar`组件，它接收一个`src`属性并显示到`img`标签。这个组件非常简单，但是在使用的时候不是很方便，因为我们需要传递一个完整的图片地址给它。我们使用的时候，希望只传递用户的名字就可以显示头像图片，这种场景使用高阶组件实现是最合适的。

`withAvatarURL`函数接收一个内部组件，然后返回一个高阶函数，在这个例子中，内部组件就是`Avatar`，然后我们可以接收一个用户名，再通过用户名查询用户头像URL显示到页面上。

`this.$attrs`用于获取组件所有属性，这是2.4之后才支持的功能，下面代码我们把高阶组件设置的属性传递给原始组件。

```javascript
// 该函数只是用来模拟网络请求
function fetchURL (username, cb) {
  setTimeout(() => {
    // hard coded, bonus: exercise: make it fetch from gravatar!
    cb('https://avatars3.githubusercontent.com/u/6128107?v=4&s=200')
  }, 500)
}

// 基础组件，只负责把传入src属性显示到一个图片标签
const Avatar = {
  props: ['src'],
  template: `<img :src="src">`
}

function withAvatarURL (InnerComponent) {
  return {
    props: ['username'],
    inheritAttrs: false, // 2.4 only
    data () {
      return { url: null }
    },
    created () {
      fetchURL(this.username, url => {
        this.url = url
      })
    },
    render (h) {
      return h(InnerComponent, {
        attrs: this.$attrs, // 2.4 only
        props: {
          src: this.url || 'http://via.placeholder.com/200x200'
        }
      })
    }
  }
}

const SmartAvatar = withAvatarURL(Avatar)

new Vue({
  el: '#app',
  components: { SmartAvatar }
})
```

## 4.1 高阶函数和mixin的选择

在上面案例的场景中，其实用minxin也是可以实现的，但是使用高阶组件有以下优势：

1. **重用性**。因为minxin对原组件具有侵入性，这会导致原来组件的可重用性降低，而高阶组件不会，高阶组件对原组件只是一个调用关系，并没有修改原来组件任何内容。
2. **可测试性**。因为高阶组件只是一个嵌套关系，在组件测试的时候，可以单独的测试原始组件和高阶组件。
3. **层级问题**。高阶组件也有他的弊端，如果你高阶组件嵌套层级太深，会导致出错的时候调试困难的问题，所以到底使用高阶组件和minxin需要看实际场景。
