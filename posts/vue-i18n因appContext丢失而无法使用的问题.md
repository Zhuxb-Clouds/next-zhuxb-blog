---
date: 2025-01-11
tags: [Vue]
---

最近，在使用`vue-i18n`插件的时候遇到了这样的问题：

![](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202501120017322.png)

![image-20250111120023834](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202501120016880.png)

前者是在Chrome浏览器上，后者是在FireFox浏览器上。

报错的直接诱因是在某个组件上直接引入了`vue-i18n`并使用了`useI18n`。

```ts
import { useI18n } from "vue-i18n"
const { t } = useI18n()
```

甚至导致整个项目都白屏无法渲染。

在排查问题之后，我发现这是由于使用`vue-i18n`的那个组件中的`appContext`的`app`为`null`导致的。

![image-20250111120230486](https://cdn.jsdelivr.net/gh/Zhuxb-Clouds/PicDepot/img/202501120016518.png)

因为`vue-i18n`将自己的功能函数挂载在`app`这个全局上下文中，而这个组件是使用`createVNode`创建并渲染在`body`上的，因为某些原因就丢失了`appContext`的`app`，因此`vue-i18n`找不到自己的SYMBOL，最终导致报错。

## 解决方法

解决方法也很简单，直接在`createVNode`里调用`const { appContext } = getCurrentInstance()!`，再将父组件的`appContext`赋值给它就可以了。

```ts
const { appContext } = getCurrentInstance()!
const vm = createVNode(component, props);
vm.appContext = appContext;
```

或者还有另一种解法，写一个vue插件，全局注入appContext。

```ts
import { App, inject, AppContext } from "vue";

interface ProvideAppPluginOptions {
  globalPropertyName?: string; // 全局属性名
  onInstall?: (appContext: AppContext) => void; // 安装插件时的回调
}

const key = "__CURRENT_APP_CONTEXT__";

export const ProvideAppPlugin = {
  install(app: App, options: ProvideAppPluginOptions = {}) {
    if (!app || typeof app.provide !== "function") {
      throw new Error("ProvideAppPlugin requires a valid Vue app instance.");
    }

    // 获取完整的 appContext
    const appContext = app._context;

    // 注入 appContext
    app.provide(key, appContext);

    // 可选：设置全局属性
    if (options.globalPropertyName) {
      app.config.globalProperties[options.globalPropertyName] = appContext;
    }

    // 可选：执行回调
    if (options.onInstall) {
      options.onInstall(appContext);
    }
  },
};

// 获取当前 appContext
export function useCurrentAppContext(): AppContext {
  const appContext = inject<AppContext>(key);
  if (!appContext) {
    throw new Error(
      "useCurrentAppContext must be used within a Vue component where ProvideAppPlugin is installed."
    );
  }
  return appContext;
}

// 获取当前 app 实例（从 appContext 中提取）
export function useCurrentApp(): App {
  const appContext = useCurrentAppContext();
  return appContext.app;
}
```

然后直接调用获取：

```ts
import { useCurrentAppContext } from '@/plugins/ProvideAppPlugin';
const vm = createVNode(component, props);
const appContext = useCurrentAppContext();
if (appContext) {
	vm.appContext = appContext;
}
```

