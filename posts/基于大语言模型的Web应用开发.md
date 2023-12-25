---
title: "基于大语言模型的Web应用开发"
date: "2023-12-25"
tags: "LLM","Web"
---

许多人——包括我，对于基于大语言模型的Web应用，还停留在Chat GPT与五花八门的AI agent上。作为一个开发人员，对大语言模型的web应用开发的认知依然是对后端已经实现的接口进行调用。然而“日进一寸”，如今的社群对大语言模型的web应用早已又迈出了新的一步。

# ChatGPT like 应用

抛开后端使用了什么模型，如何实现的接口，LLM Web应用最浅显的实现方式自然就是类似与ChatGPT一般直接调用接口。 我们以ChatGPT为例，它往往提供一个Key与相应的SDK，通过SDK将Key与对话包装成网络请求调用接口。

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Who won the world series in 2020?"},
    {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
    {"role": "user", "content": "Where was it played?"}
  ]
)
```

这类应用往往会预设一些模板，让AI扮演某个角色，在message之前增加小段文本，以达到one-shot或者few-shot的效果。

# AI Agent 应用

这类应用往往分为**Autonomous Agents 和 Generative Agents**，前者如AutoGPT，代表了通过自然语言的需求描述，能够自动化执行各项任务达成目标结果；而后者如斯坦福发表的 25 个智能体的虚拟小镇，Generative Agents 作为一个具有类人格特征、自主决策能力以及长期记忆等特征，更偏向“原生性”概念的 AI-Agents。

再有就类似于**NexusGPT** 基于 LangChainAI 的框架，使用 GPT-3.5 的 API 和 Chroma（一个 AI-native 的开源嵌入式数据库），这些都依赖于 OpenAI 和 LangchainAI 的函数调用的支持。

# 本地化LLM Web 应用

除了依赖于后端实现的两种方式，还有将目光投向本地算力的某些利用客户端技术的LLM Web 应用。现如今越来越多设备开始携带GPU，WebGPU API也被视为WebGL的后继者写入了浏览器规范，我们也许是时候重视使用本地化的LLM与GPU资源来构建Web应用了。

在十月，LangChainAI的Jacob发布了一个相关的博文，他使用 Ollama 作为一种简便的方式来运行本地模型，它可以通过一个简单的 shell 命令将本地运行的模型与 Web 应用连接。以此实现 LangChain 中一个极受欢迎的应用场景：使用开源和本地运行的软件来实现一个执行检索增强生成（Retrieval-Augmented Generation，简称 RAG）的链条。

这个过程主要包括以下几个步骤：

1. 将文档（PDF、网页或其他形式的数据）切分成含有独立意义的小块。
2. 利用一种叫做嵌入模型（embeddings model）的技术，为每一小块生成向量形式的表示。
3. 把这些小块及其向量表示加载到一个特殊的数据库——向量存储（vector store）里。

# langChain

LangChain是一个强大的框架，旨在帮助开发人员使用语言模型构建端到端的应用程序。它提供了一套工具、组件和接口，可简化创建由大型语言模型 (LLM) 和聊天模型提供支持的应用程序的过程。LangChain 可以轻松管理与语言模型的交互，将多个组件链接在一起，并集成额外的资源，例如 API 和数据库。
