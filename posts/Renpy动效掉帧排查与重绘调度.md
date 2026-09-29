---
date: 2026-09-30
tags: [Renpy]
---


最近给《怀念夏天》做UI动效——四条白边从屏幕边缘收进/展开，结果掉帧掉得没法看。排查过程中把 Ren'Py 的帧率控制机制翻了下，姑且记录一下。

## Ren'Py 是怎么控制帧率的

**实际上，Ren'Py 自己不设渲染帧率上限，桌面端的帧率由垂直同步（vsync）决定。**

gl2 渲染器初始化时会根据 `preferences.gl_framerate` 算交换间隔（swap interval）：默认 `None` 就是"每个刷新周期出一帧"，60Hz 屏就是 60fps。设了值则是整数分频——144Hz 屏配 60 算出来是 `round(2.4)=2`，实际 72fps，除不尽不会精确到 60。想调试可以直接改环境变量 `RENPY_GL_VSYNC`。

另外更重要的一点是——**空闲时根本不画**。主循环每轮z `should_redraw()`——没有动画、没有事件就直接阻塞等输入，CPU 占用趋近于零，最长每 0.2 秒刷一次保底。动画也不是按固定帧率驱动的：transform 用 `renpy.display.render.redraw()` 注册"未来某个时刻再画一次"，到点才触发那一次。

所以掉帧只有一种可能：**单帧渲染时间超过了帧预算**（60fps 的预算是 16.6ms）。

>  `config.framerate = 100` 这个配置只对软件渲染器 swdraw 生效，gl2 下改它没有任何作用。

## canvas() 要谨慎使用

窗框组件用 `canvas()` 画四条边，看起来人畜无害：

````python
rv = renpy.Render(self.width, self.height)
canvas = rv.canvas()
canvas.rect(col, (0, 0, w, int(cur["top"])))
````

但翻引擎源码会发现，`canvas()` 每次调用都**新建一张整个 Render 尺寸的软件 surface**。窗框是 3860×2160，RGBA 一张就是 33MB。动画期间每个 vsync 帧都在重复这套流程：分配并清空 33MB 内存 → CPU 上画 4 个矩形 → 整张 33MB 作为**新**纹理上传 GPU（每帧都是新对象，纹理缓存必然 miss）→ 释放旧纹理。60fps 下这是每秒 2GB 的上传带宽，单帧十几毫秒就这么没了。

修法倒是简单：纯色矩形根本不需要画进像素图。gl2 里 `Solid` 走的是 `renpy.solid` shader 纯 GPU 填充，零纹理上传：

````python
rv.blit(renpy.render(self.solid, w, int(cur["top"]), st, at), (0, 0))
````

四条边各渲染一个 Solid blit 进 Render 就完事。动画状态、重绘节奏全都不用动，只换绘制后端，掉帧直接消失。

## 静态组件的无条件重绘

顺着排查扫项目，发现了更隐蔽的一类。之前写的CDD：Dot、Cross、Bubble都是静态图形，`render()` 末尾写了一句：

````python
renpy.redraw(self, 0)
````

这导致只要它们在屏幕上，Ren'Py 就永远处于有东西要画的状态。

修法就是把这句删掉，让渲染结果进缓存。

子组件重绘时，失效会沿着渲染树自动向上传播，比如气泡里放个闪烁光标的输入框，气泡照样每帧跟着更新。

## 动画播完不终止问题

- **PositionWrapper / BubbleWrapper**：位移、淡入播完（progress 到 1）后每帧继续重绘一模一样的内容，隐藏后甚至每帧重绘一个空 Render；
- **Slider**（设置页音量条）：`event()` 末尾无条件重绘，全屏任何鼠标移动都会重渲染它——而它的视觉只随 `setPercent` 变化，那里本来就有调度；
- **PreviewSlowText**（文字速度预览的打字机）：打完了还在转，白白维持整个设置页的全速合成。

还有一个最隐蔽的：**Stress**（hover 展开的按钮框）。它的 hover/点击状态切换完全依赖"每帧重绘"才能被引擎发现，代码里任何地方都不主动调度。这种情况直接改成条件重绘会让动效直接失灵——得先在 `set_transform_event` 和点击事件处补上 `renpy.redraw()`，render 里才敢只在实际播动画时续期。

更聪明的做法是：**动画进行中才续期重绘，状态切换的地方主动 `renpy.redraw()` 一次。**
