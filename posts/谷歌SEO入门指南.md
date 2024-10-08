---

date: 2024-02-19
tags: [SEO]
---

Google 搜索中心是由谷歌官方提供给开发者的简单SEO（搜索引擎优化）入门，本文档会对内容总结，并且提供一些前端在编写Index.html时候的建议。

# 抓取：谷歌发现网页的方式

>  第一阶段是找出网络上存在哪些网页。不存在包含所有网页的中央注册表，因此 Google  必须不断搜索新网页和更新过的网页，并将其添加到已知网页列表中。此过程称为“网址发现”。由于 Google 之前已经访问过某些网页，因此这些网页是 Google 已知的网页。当跟踪已知网页上指向新网页的链接时，Google  会发现其他网页，例如类别网页等中心页会链接到新的博文。当您以列表形式（[站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=zh-cn)）提交一系列网页供 Google 抓取时，Google 也会发现其他网页。



# 标题

`<title>`将会直接影响谷歌的搜索结果，合理的标题毋庸置疑是最重要的。



# Url地址

## 面包屑导航

面包屑导航指的是在访问网页资源地址时，常常存在类似于`http://example.com/cat/book.html`类似的url地址，而其中`http://example.com`被称为网域，而`cat/book`就是面包屑导航，它暗示了此页面的内容，谷歌会自动理解。当然，也可以使用*结构化数据*引导谷歌理解这些面包屑导航。

> 尽量在网址中包含可能对用户有用的字词；例如：
> ```
> https://www.example.com/pets/cats.html
> ```
> 仅包含随机标识符的网址对用户没有多大帮助；例如：
> ```
> https://www.example.com/2/6772756D707920636174
> ```



# 元信息

> 使用有效的 HTML 指定页面元数据可确保 Google 能够使用所指定的元数据。即使 HTML 无效或与 [HTML 标准](https://html.spec.whatwg.org/multipage/)不符，Google 也会尽力理解 HTML，但标记中的错误可能会导致 Google 搜索利用元数据的方式出现问题。

## 减少重复内容

在某些业务场景下，我们会需要让不同网址显示相同内容，这种情况称为*重复内容*。搜索引擎会针对每个内容选择一个网址（规范网址）向用户显示。这虽然不违反谷歌的网络垃圾政策，却可能造成糟糕的体验。

我们可以使用`rel="canonical" `或是**重定向**等技术手段指定规范网页。

## 摘要

> 在标题链接下方，搜索结果通常包含目标网页的说明，可帮助用户决定是否应点击该搜索结果。这称为摘要。Google 有时会利用网页中的  `<meta name="description" content="">` 标记来生成搜索结果摘要，因为在这些情况中，Google 认为与完全来自网页内容的摘要相比，这样生成的摘要可以为用户提供更准确的描述。

例如：

`<meta name="description" content="在小镇 Whoville，一位当地老年人在一场重要活动前夜窃取了所有人的礼物，这使小镇陷入混乱。敬请关注关于此事件的实时动态。">`



## Google 支持的 `meta` 标记的列表

| meta标记                                                     | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `<meta name="description" content="A description of the page">` | 此标记用于提供一段有关网页的简短说明。在某些情况下，此说明将用在[搜索结果中显示的摘要](https://developers.google.com/search/docs/appearance/snippet?hl=zh-cn)中。 |
| `<meta name="robots" content="..., ...">`                        <br />  `<meta name="googlebot" content="..., ...">` | 这些 `meta` 标记可以控制搜索引擎的抓取和索引编制行为。       |
| `<meta name="google" content="nositelinkssearchbox">`        | 当用户搜索您的网站时，Google 搜索结果有时会显示一个供您网站专用的搜索框，以及其他直接指向您网站的链接。此标记用于告知 Google 不要显示站点链接搜索框。 |
| `<meta name="googlebot" content="notranslate">`              | 如果 Google 发现网页内容所用的语言不是用户可能想阅读的语言，可能会在搜索结果中提供[经过翻译的标题链接和摘要](https://developers.google.com/search/docs/appearance/translated-results?hl=zh-cn)。 |
| `<meta http-equiv="refresh" content="...;url=...">`          | 此标记通常称为元刷新，会在一段时间后将用户转到新网址，有时也会被用作一种简单的重定向形式。不过，[并非所有浏览器都支持使用此元标记，因而可能会令用户感到困惑](https://www.w3.org/TR/WCAG10-HTML-TECHS/#meta-element)。        我们建议改用服务器端 [`301` 重定向](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=zh-cn)。 |
| `<meta name="viewport" content="...">`                       | 此标记可告知浏览器如何在移动设备上呈现网页。此标记的存在可向 Google 表明该网页适合移动设备。 |
| `<meta name="rating" content="adult">`                              `<meta name="rating" content="RTA-5042-1996-1400-1577-RTA">` | 将网页标记为包含露骨的成人内容，以表明该网页应被安全搜索滤除。 |



## 元关键字

 Google 搜索[不使用关键字元标记](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag?hl=zh-cn)。

# 标签

## 指向相关资源的链接

谷歌抓取链接的原理是搜寻一个页面上的所有相关资源链接，并且会一层一层的深入，因此某些跳转的资源最好包含链接信息提供给谷歌抓取。

#### 链接文字

某些需要跳转的关键字，可以这样编写：

> 我今年写了很多与奶酪相关的文章：谁能忘记<a href="https://example.com/blue-cheese-vs-gorgonzola">**对蓝纹奶酪和戈尔根朱勒干酪的争议**</a>、获得 Cheesiest Research Medal 殊荣的<a href="https://example.com/worlds-oldest-brie">**全球最古老的那块布里干酪**</a>、对<a href="https://example.com/the-lost-cheese">**丢失的奶酪**</a>的史诗般复述，以及我个人的最爱即<a href="https://example.com/boy-and-his-cheese">**男孩与奶酪：两个不可思议的朋友的故事**</a>。    

需要遵循的原则是：不要太长的关键字、描述性文字为上。

## 出站链接

> 对于您网站上的某些链接，您可能需要向 Google 说明您的网站与链接页之间的关系。为此，请在 `<a>` 标记中使用下列 `rel` 属性值之一。Google 通常不会跟踪标有这些 `rel` 属性的链接。请注意，链接页也可能经由其他途径找到（例如站点地图或其他网站的出站链接），因此仍有可能被抓取。

对于站内链接与出站链接，谷歌有不同的抓取行为。但如果希望无任何限定条件便直接提取和解析的常规链接，也无需添加 `rel` 属性。

| `rel` 值          | 对应的语义                                                   |
| ----------------- | ------------------------------------------------------------ |
| `rel="sponsored"` | 请使用 `sponsored` 值标记广告链接或付费展示位置链接（通常称为“付费链接”）。 |
| `rel="ugc"`       | 建议您使用 `ugc` 值标记用户生成的内容（例如评论和论坛帖子）的链接。 |
| `rel="nofollow"`  | 如果其他值不适用，并且您希望 Google 不跟踪您网站上的出站链接，或不从您的网站上抓取链接页，请使用 `nofollow` 值。 |

## 使用 `noindex` 阻止搜索引擎编入索引

> `noindex` 是一个包含 `<meta>` 标记或 HTTP 响应标头的规则集，用于防止支持 `noindex` 规则的搜索引擎（例如 Google）将内容编入索引。

```
<meta name="robots" content="noindex">
```

## 为图片添加描述性替代文本

替代文本是一段简短的描述性文本，用于说明图片和内容之间的关系。尽量使用`<img>`标签的`alt`来让搜索引擎理解图片内容，

