---
title: "Renpy生成翻译文件报错'expected ':' not found.'的问题解决方案"
date: "2023-04-11"
tag: "Renpy"
---
# Renpy生成翻译文件报错'expected ':' not found.'的问题解决方案

**版本**:Ren'py 7.5.3 python2

## 问题描述

当label包含中文的时候，使用renpy生成翻译会在翻译文件生成后，编辑器会提示：

> *启动工程失败。在执行此命令之前，请确保您的工程可正常运行。*

此时重启游戏，会报错：`expected ':' not found.`

## 解决方法

打开编辑器中`/renpy/parser.py`文件，修改`hash`方法如下：

```python
    def hash(self):
        """
        Matches the characters in an md5 hash, and then some.
        """
        # raise Exception(self.match(r'\w+[\u4e00-\u9fa5]*'))
        return self.match(r'[\w\u4e00-\u9fa5]+')
```

再次启动游戏，此时问题解决不再报错。



## 问题原因

因为Ren'py 7.5.3使用 python2 版本，原本 hash 方法的正则`r'\w+'`无法匹配到中文，因此报错。（此问题到python3应该就能修复，即升级Renpy8）



## 解决思路

当看见报错信息`expected ':' not found.`，明显是一个字符串的截取或是正则问题，但由于Renpy报错没有调用栈（可能是我没找到怎么看），在外层绕了半天，总算想到在代码中直接抛出错误。

先是来到`/renpy/parser.py`的`require`方法（这里是抛出"expected '%s' not found." % name错误的地方），直接抛出错误，如下：

```python
        if rv is None:
            raise Exception(dir(self))
            self.error("expected '%s' not found." % name)
```

终于得到了调用栈

```
Full traceback:
  File "renpy/bootstrap.py", line 331, in bootstrap
    renpy.main.main()
  File "renpy/main.py", line 492, in main
    renpy.game.script.load_script() # sets renpy.game.script.
  File "renpy/script.py", line 283, in load_script
    self.load_appropriate_file(".rpyc", ".rpy", dir, fn, initcode)
  File "renpy/script.py", line 781, in load_appropriate_file
    data, stmts = self.load_file(dir, fn + source)
  File "renpy/script.py", line 594, in load_file
    stmts = renpy.parser.parse(fullfn)
  File "renpy/parser.py", line 2962, in parse
    rv = parse_block(l)
  File "renpy/parser.py", line 2924, in parse_block
    stmt = parse_statement(l)
  File "renpy/parser.py", line 2908, in parse_statement
    return pf(l, loc)
  File "renpy/parser.py", line 2647, in translate_statement
    l.require(':')
  File "renpy/parser.py", line 1329, in require
    raise Exception(dir(self))
```

在`translate_statement`方法中打印`identifier`，明显发现字符串只截取到了中文前面，到此处就很容易了，找到`hash`方法，补完其中的正则就行了。
