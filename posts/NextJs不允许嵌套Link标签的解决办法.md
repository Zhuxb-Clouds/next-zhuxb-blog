---
date: 2025-02-05
tags: [NextJs,React]
---

在使用 Next.js 的 `<Link>` 组件时，开发者可能会遇到一个常见的问题：当你尝试将 `<Link>` 标签互相嵌套时，会收到错误提示。这是因为从 Next.js 13 开始，`<Link>` 组件本身就会渲染为一个 `<a>` 标签，因此不允许再嵌套另一个 `<a>` 标签。

## legacyBehavior 的作用

为了处理这个问题，Next.js 引入了 `legacyBehavior` 属性。使用这个属性可以让开发者继续使用旧版的嵌套方式。具体来说，当你在 `<Link>` 中使用 `legacyBehavior` 时，可以像下面这样写：

```javascript
import Link from 'next/link';

export default function Home() {
  return (
    <Link href="/about" legacyBehavior>
      <a>Go to About Page</a>
    </Link>
  );
}
```

这样，此`Link`标签就不会再渲染为`a`标签，自然也不会报错了。

> An `<a>` element is no longer required as a child of `<Link>`. Add the legacyBehavior prop to use the legacy behavior or remove the `<a>` to upgrade. A codemod is available to automatically upgrade your code.

