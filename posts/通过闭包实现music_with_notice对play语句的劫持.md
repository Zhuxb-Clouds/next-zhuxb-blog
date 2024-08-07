---
title: "通过闭包实现music_with_notice对play语句的劫持"
date: "2024-04-07"
tag: "Renpy"
---


有如下一个需求：在renpy脚本中使用`play music`时，自动的调用renpy.notice显示歌曲的名称。

首先我们需要知道，`play music`实际上调用的是 `renpy.audio.music.play`，因此基本的思路便是：先将原本的play函数保存在某处，定义一个新的`music_with_notice`函数，在函数内执行逻辑后将参数透传给保存的`paly`函数。

```python
origin_play = renpy.audio.music.play 

def music_with_notice(filenames, channel="music", loop=None, **kwargs):
      if channel == "music":
        renpy.notify(filenames)
      if origin_play:
        origin_play(filenames, channel=channel, loop=loop, **kwargs)
        
renpy.audio.music.play = music_with_notice
```

但是这样在autoreload模式下存在问题，保存的变量会被重置，但renpy.audio.music.play却还是music_with_notice。在重新执行原函数赋值的过程中就造成了无限递归，而递归超过一定限度就会报错。

因此，将变量放在闭包中缓存，就可以规避此问题，将无线递归变为有限递归。

```python
def closure():
  origin_play = renpy.audio.music.play
  def music_with_notice(filenames, channel="music", loop=None, **kwargs):
    if channel == "music":
      renpy.notify(filenames)
    if origin_play:
      origin_play(filenames, channel=channel, loop=loop, **kwargs)
  return music_with_notice
    
renpy.audio.music.play = closure()
```

## 一种使用wraps实现的方法

除开以上代码，还有一种实现**函数重定义**的方法，通过functools的wraps，更加简洁，具体代码如下：

```python
  from functools import wraps


  def music_with_notice(filenames, channel=None, loop=None, **kwargs):
    if channel == "music" and isinstance(filenames, str):
      renpy.notify(filenames)
    origin_play(filenames, channel=channel, loop=loop, **kwargs)
    
  origin_play = renpy.audio.music.play
  renpy.audio.music.play = wraps(origin_play)(music_with_notice)

```
