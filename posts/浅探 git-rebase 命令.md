---
title: "浅探 git-rebase 命令"
date: "2024-01-02"
tag: "git,译文"
---


> 信息来源：[Git document git-rebase](https://git-scm.com/docs/git-rebase)

## 名称

git-rebase - 在另外一个分支（ base tip）顶部重新提交commits。

```
git rebase [-i | --interactive] [<options>] [--exec <cmd>]
	[--onto <newbase> | --keep-base] [<upstream> [<branch>]]
git rebase [-i | --interactive] [<options>] [--exec <cmd>] [--onto <newbase>]
	--root [<branch>]
git rebase (--continue | --skip | --abort | --quit | --edit-todo | --show-current-patch)
```

## 简介

> If `<branch>` is specified, `git rebase` will perform an automatic `git switch <branch>` before doing anything else.  Otherwise it remains on the current branch.

如果已经指定了一个分支，git rebase 在做任何其他事情之前，将自动执行一个 `git switch <branch>`。否则就将会保持在当前分支。

> If `<upstream>` is not specified, the upstream configured in `branch.<name>.remote` and `branch.<name>.merge` options will be used (see [git-config[1\]](https://git-scm.com/docs/git-config) for details) and the `--fork-point` option is assumed.  If you are currently not on any branch or if the current branch does not have a configured upstream, the rebase will abort.

如果`<upstream>`不是确定的，那么 upstream 会被配置为 `branch.<name>.remote`，`branch.<name>.merge` 选项将会被使用，并且假定使用 `--fork-point`选项。如果你当前不在任何分支或者当前分支并没有配置 upstream  ，rebase行为将会被中止。

> All changes made by commits in the current branch but that are not in `<upstream>` are saved to a temporary area.  This is the same set of commits that would be shown by `git log <upstream>..HEAD`; or by `git log 'fork_point'..HEAD`, if `--fork-point` is active (see the description on `--fork-point` below); or by `git log HEAD`, if the `--root` option is specified.

所有在当前分支下来自commits的变更，但在不在`<upstream>`的都会被保存在暂存区，这与 `git log <upstream>..HEAD` 显示的提交集相同；或者是与 `--fork-point` 激活时的 `git log 'fork_point'..HEAD` 显示的commits集合相同；或者是在指定了 `--root` 选项时的 `git log HEAD` 显示的commits集合。

> The current branch is reset to `<upstream>` or `<newbase>` if the `--onto` option was supplied. This has the exact same effect as `git reset --hard <upstream>` (or `<newbase>`). `ORIG_HEAD` is set to point at the tip of the branch before the reset.

当前的branch reset到`<upstream>` 或是 `<newbase>`，如果提供了`--onto`选项。这具有与`git reset --hard <upstream>`（或`<newbase>`）完全相同的效果。在重置之前，`ORIG_HEAD`被设置为指向该分支的末端。

> [NOTE]
`ORIG_HEAD` is not guaranteed to still point to the previous branch tip at the end of the rebase if other commands that write that pseudo-ref (e.g. `git reset`) are used during the rebase. The previous branch tip,however, is accessible using the reflog of the current branch (i.e. `@{1}`, see linkgit:gitrevisions[7]).

【注】

在 rebase 结束时，如果在 rebase 过程中使用了其他写入 `ORIG_HEAD` 的命令（例如 `git reset`），则无法保证其仍指向先前的分支提示。不过，可以通过当前分支的 reflog（即 `@{1}`，参见 linkgit:gitrevisions[7]）访问先前的分支提示。

> The commits that were previously saved into the temporary area are then reapplied to the current branch, one by one, in order. Note that any commits in `HEAD` which introduce the same textual changes as a commit in `HEAD..<upstream>` are omitted (i.e., a patch already accepted upstream with a different commit message or timestamp will be skipped).

之前保存在临时存储区的提交将逐个重新应用到当前分支上。需要注意的是，如果在 `HEAD` 中有某个提交引入了与 `HEAD..<upstream>` 中相同的文本更改，则会被省略掉（也就是说，已经以不同的提交消息或时间戳被上游接受的补丁将被跳过）。

> It is possible that a merge failure will prevent this process from being completely automatic.  You will have to resolve any such merge failure and run `git rebase --continue`.  Another option is to bypass the commit that caused the merge failure with `git rebase --skip`.  To check out the original `<branch>` and remove the `.git/rebase-apply` working files, use the command `git rebase --abort` instead.

rebase中合并的失败可能会中止整个自动化过程，你需要解决合并失败并且执行`git rebase --continue`。或是使用`git rebase --skip`忽略导致合并失败的commit。若要切换回原始的 `<branch>` 并移除 `.git/rebase-apply` 的工作文件，可以使用命令 `git rebase --abort`。

> Assume the following history exists and the current branch is "topic":

假设存在这样的历史记录，并且当前分支处于”topic“上。

```
          A---B---C topic
         /
    D---E---F---G master
```

如果在这里执行以下某个指令：

    git rebase master
    git rebase master topic

则会变成。

```
                  A'--B'--C' topic
                 /
    D---E---F---G master
```

> **NOTE:** The latter form is just a short-hand of `git checkout topic` followed by `git rebase master`. When rebase exits `topic` will remain the checked-out branch.

**注意：** 后一种形式其实就是先执行 `git checkout topic`，然后再执行 `git rebase master` 的简化写法。当 rebase 完成后，`topic` 将继续保持为当前所检出的分支。

> If the upstream branch already contains a change you have made (e.g., because you mailed a patch which was applied upstream), then that commit will be skipped and warnings will be issued (if the *merge* backend is used).  For example, running `git rebase master` on the following history (in which `A'` and `A` introduce the same set of changes, but have different committer information):

如果远端分支已经包含你做出的某一个改变（例如你发送了一个补丁并且该补丁已经被上游接受），这个commit就会被跳过并且报一个警告（如果使用了 *merge* 合并后端）。举个例子，执行`git rebase master`在提交记录上，（`A'`与`A` 更改内容相同，但是有不同的提交信息）

```
          A---B---C topic
         /
    D---E---A'---F master
```

结果会是：

```
                   B'---C' topic
                  /
    D---E---A'---F master
```

> Here is how you would transplant a topic branch based on one branch to another, to pretend that you forked the topic branch from the latter branch, using `rebase --onto`.

以下是如何将一个基于 *topic* 分支移动到另一个分支，并使其看起来像是您是从后一个分支创建了 *topic* 分支，使用 `rebase --onto` 命令。

> First let’s assume your *topic* is based on branch *next*. For example, a feature developed in *topic* depends on some functionality which is found in *next*.

首先，我们假设 *topic* 分支是基于 *next* 分支。举个例子，一个特性在topic分支上开发，并且依赖于 *next* 的一些功能。

```
   o---o---o---o---o  master
         \
          o---o---o---o---o  next
                           \
                            o---o---o  topic
```

> We want to make *topic* forked from branch *master*; for example, because the functionality on which *topic* depends was merged into the more stable *master* branch. We want our tree to look like this:

我们希望将 *topic* 分支看作是从 *master* 分支分叉出来的；例如，因为 *topic* 依赖的功能已经合并到更为稳定的 *master* 分支中。我们希望我们的分支树看起来像这样：

```
    o---o---o---o---o  master
        |            \
        |             o'--o'--o'  topic
         \
          o---o---o---o---o  next
```

可以使用如下命令：

```
git rebase --onto master next topic
```

> Another example of --onto option is to rebase part of a branch.  If we have the following situation:

另外一个使用 *--onto* 选项的例子是变基部分的 *branch* ，如果我们面对如下的情况。

```
                            H---I---J topicB
                           /
                  E---F---G  topicA
                 /
    A---B---C---D  master
```

执行如下命令

```
git rebase --onto master topicA topicB
```

结果会是这样的：

```
                 H'--I'--J'  topicB
                /
                | E---F---G  topicA
                |/
    A---B---C---D  master
```

> This is useful when topicB does not depend on topicA.
>
> A range of commits could also be removed with rebase.  If we have the following situation:

这是一个很有用的命令，当 topicB 基于 topicA。

利用 rebase 命令也可以移除一系列的提交，如果我们面对如下情况：

```
   E---F---G---H---I---J  topicA
```

执行：

```
git rebase --onto topicA~5 topicA~3 topicA
```

结果会切去F和G的commit

```
    E---H'---I'---J'  topicA
```

> This is useful if F and G were flawed in some way, or should not be part of topicA.  Note that the argument to `--onto` and the `<upstream>` parameter can be any valid commit-ish.

如果 F 和 G 存在问题，或者不应该成为 *topicA* 的一部分，则这种方法非常有用。请注意，`--onto` 参数和 `<upstream>` 参数可以是任何有效的类commit。

> In case of conflict, `git rebase` will stop at the first problematic commit and leave conflict markers in the tree.  You can use `git diff` to locate the markers `(<<<<<<)` and make edits to resolve the conflict.  For each file you edit, you need to tell Git that the conflict has been resolved, typically this would be done with

在某些冲突的情况，`git rebase`将会停止在第一次造成问题的 commit 并且留下冲突标记在树上，你可以使用`git diff` 去定位这些标记`(<<<<<<)`并且做出变更去解决冲突。对于你编辑过的每一个文件，你需要告诉Git那些冲突已经被解决，使用：

```
git add <filename>
```

> After resolving the conflict manually and updating the index with the desired resolution, you can continue the rebasing process with:

在解决冲突并且更新暂存区，你可以继续 rebase 进程

```
git rebase --continue
```

> Alternatively, you can undo the *git rebase* with

亦或者，你可以撤销 git rebase 

```
git rebase --abort
```
