---

date: 2021-07-11
tags: [Renpy]
---

此文本是在研究完7号问题（假山遮片）之后，所衍生的对transform参数的查缺补漏，请配合代码块一起食用。

```python
image hiddenM:
    contains:
        "images/假山遮片1.png"
        topleft
        ease 3 yoffset -90
    contains:
        "images/假山遮片2.png"
        topleft
        ease 3 yoffset 360

image fakeM = "images/假山.png"

label start:
    scene fakeM:
        topleft
    show hiddenM

    "测试用"
    return

```

## 1.假山问题之解

先单看假山问题，首先是image下面这个contains语句，此物类似于一个组件，将不同的部件拼接在一起，**contains语句的执行是即时的，不会等待子组件的完成。**contains语句可以说是语法糖，使我们很容易将参数传给它的子组件。

 *(译者注：语法糖(Syntactic Sugar)，也称作糖衣语法。由英国计算机科学家彼得·约翰·兰达(Peter J. Landin)发明。指计算机语言中添加的某种语法，对语言的功能并没有影响，能更方便程序员使用。通常来说使用语法糖能够增加程序的可读性，从而减少程序代码出错的机会。)*

将两个遮片整合入hiddenM之后，我将他们都固定在pos 0，即topleft位置（更低层的假山【这个图片的原名叫做假山-全】也一样）。

接下来是对图片进行transform，根据[transform特性列表](https://renpy.cn/doc/atl.html?highlight=image%20contain#transform-properties)，很容易知道是对其yoffset进行更改使其改变位置。

当然光是改变静态的位置也是不够的，通过查询文档，我发现一个叫做[warpers](https://renpy.cn/doc/atl.html?highlight=linear%20ease#warpers)的函数。

此函数的描述为：*warper是一类函数，其可以改变interpolation语句中定义的时间值。*

也许静态的变换并非毫无中间过程，而是变换的时间默认为0，而warper函数是改变了这个默认时间。

关于warper下面几个语句定义曲线就不赘述了。

**值得一提的是：我使用的是720p的素材，所以请在参数后面乘以1.5。**

## 2.假山问题之遗

之后的事情就很容易了，此处不再赘述，但是我还有两个未解的疑惑。

1）两张image组件的互相重叠（层的高度）是有什么决定的？

此处大胆猜测是先后顺序，代码中先出现的fakeM就比后出现的hiddenM低。

2）为什么hiddenM的两个contains组件同时开始变换？（此处是因为我最早使用两个hiddenM两个contains，在顺序的语句下切换也是同时才发出的疑问）

现在看了，应该就是contains语法糖的即时性在起作用，不会等待子组件语句的顺序，而是同时执行。

## 3.关于其他问题的畅想

也许以上此种也能解决

4号问题-立绘平移：可以在label之后的show语句下面加warper函数让立绘移动

5号问题-画面黑白的剩余：使用warper函数将变灰的过程显示出来（这个存疑，因为线性变换不一定有过程）

8号问题-立绘渐入渐出时的动效：创建一个ALT叫做apper，包括淡入和变换两个动画效果，然后放在所有的名字下面

10号问题-场景拉动特效：做一个较为复杂的曲线，拉动场景（也可以用之前那个默认函数hpunch）



