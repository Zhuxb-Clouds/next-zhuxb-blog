---
title: "回到标题与BookMark"
date: "2021-06-27"
tag: "KrKr"
---

## 回到标题机制

于macro_ui.ks的回到标题按钮（sysbutton）会调用kag.goToStartWithAsk()以存读档的方式完美回到标题。


```c
function goToStart()
{
	// 最初に戻る
	if(!startAnchorEnabled) return;
	loadBookMark(2021, false); // 栞を読み込む999
}
function goToStartWithAsk()
{
	// 最初に戻る(確認あり)
    askYesNo("返回标题吗？", "确认", goToStart);
}
```

其中、goToStart会先判断startAnchorEnabled，即某处的[startAnchor]是否保存了一个startAnchor存档。

```c
function setStartAnchorEnabled(enabled)
{
	// 「最初に戻る」の有効/無効の設定
	startAnchorEnabled = enabled;
	if(enabled) saveBookMark(999, false); // 999 番に保存
	setMenuAccessibleAll();
}
```

loadBookMark会读取标记点的内容。

**tip：标记点取决于"\*|"即标签（*）以及可存储符号（|）。**

**未加（|）的标签无法存储标记点。**

## 保存标记点[startAnchor]机制

在MainWindows.tjs内，制作被【】识别的function：

```c

  startanchor : function(elm)
  {
    // 「最初に戻る」の使用不可・使用可を設定する
    setStartAnchorEnabled(elm.enabled === void || +elm.enabled);
    return 0;
  } incontextof this,
```

其使得

```c

  function setStartAnchorEnabled(enabled)
  {
​    // 「最初に戻る」の有効/無効の設定
​    startAnchorEnabled = enabled;
​    if(enabled) saveBookMark(999, false); // 999 番に保存
​    setMenuAccessibleAll();
  }
```

此代码块在savedata内保存了一个data999.ksd的文件

**tip：data1000是记录“重载脚本”功能的存档。**



## saveBookMark和loadBookMark

同样在MainWindows.tjs内，



```c
  function saveBookMark(num, savehist = true)
  {
​    // 栞番号 num に栞を保存する
​    if(readOnlyMode) return false;
​    if(bookMarkProtectedStates[num]) return false;
​    var ret = saveBookMarkToFile(getBookMarkFileNameAtNum(num), savehist);
​    if(ret)
​    {
​      // メニュー / bookMarkNames / bookMarkDates を更新
​      getBookMarkInfoFromData(pcflags, num);
​    }
​    return ret;
  }
```

请注意savehist这个参数，似乎这一项为false的情况下，saveBookMark就并不会保存ksd文件，而是如同游戏内存档一样保存。

另外，loadBookMark这个参数很蹩脚，需要原封不动的传递到loadBookMarkFromFile这个参数内：

```c
  function loadBookMark(num, loaduser = true)

  {

​    // 栞番号 num からデータを読み出す

​    return loadBookMarkFromFile(getBookMarkFileNameAtNum(num), loaduser);

  }
```

而loadBookMarkFromFile如下，

```c
  function loadBookMarkFromFileWithAsk()
  {
​    // 任意のファイルから栞を読み込む
​    var initialdir = "";
​    if(lastSaveDataNameGlobal == "")
​      initialdir = saveDataLocation + "/";
​    var selectdata = %[
​      title:"栞をたどる",
​      filter: [saveThumbnail ?
​          "サムネイル画像付き栞データ(*.bmp)|*.bmp" :
​          "栞データ(*.kdt)|*.kdt"],
​      filterIndex : 1,
​      name : lastSaveDataNameGlobal,
​      initialDir : initialdir,
​      defaultExt : saveThumbnail?"bmp":"kdt",
​      save : false,
​    ];
​    if(Storages.selectFile(selectdata))
​    {
​      loadBookMarkFromFile(lastSaveDataName = lastSaveDataNameGlobal = selectdata.name);
​      lastSaveDataName = Storages.chopStorageExt(lastSaveDataName);
​    }
  }
```

目前仅研究到这一步，能窥见标签系统与书签系统所联动模式的一角，也算有点收获。

![KAG：回到标题与BookMark](https://jsd.cdn.zzko.cn/gh/Zhuxb-Clouds/PicDepot/img/202203040911291.png)
