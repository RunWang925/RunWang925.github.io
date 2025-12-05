---
title: Solitude 主题适配指南：用 hexo-abbrlink 生成永久短链接优化文章 # 文章标题（必填）
cover: 'https://cdnimg-doge.814925.xyz/file/hexo/img/1761381238227_20251025163353953.png' # 文章封面图链接（选填，用于首页/列表页展示）
categories: # 文章分类（选填，可多个）
  - 网站建设
tags: # 文章标签（选填，可多个）
  - hexo
  - solitude
  - 主题魔改
abbrlink: 7010544e  # hexo-abbrlink 生成的永久短链接标识（必填，用于替换动态链接，避免链接失效）
date: 2025-10-25 17:25:49 # 文章发布时间（必填）
type:  # 文章类型（选填） 常见取值：post（普通文章，默认）、page（独立页面）、draft（草稿，不会生成静态文件）
comment: # 评论功能开关（选填） 取值：true（开启，默认）、false（关闭）
ai_text:  # AI 生成内容标记（选填）
recommend: true  # 文章推荐标记（选填） 取值：true（加入推荐列表）、false（不推荐）
reprint:  # 转载声明（选填）取值：转载来源链接或描述（如“转载自 xxx 博客”）
locate: # 位置信息（选填）取值：具体地理位置（如“北京”“上海”）或经纬度
---



## 一、简述

使用Hexo搭建博客已经有很长一段时间了，文章的链接也一直是使用的默认格式，文章的链接格式可以在博客根目录下的 `_config.yml` 文件中修改，默认的配置如下所示，最终生成的链接大概是这样的https://hexo.814925.xyz/2024/10/08/这是我的第一篇博文

如果说文章的标题是英文，那么生成的链接还是比较简洁的，但如果是是中文的标题，就会出现裹脚布一样超级长的乱码。

## 二、使用 hexo-abbrlink 生成短链接
使用生成短链接的插件 [hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink) 。

hexo-abbrlink 是一款用于生成固定、简洁且唯一的文章链接（短链接）的 Hexo 插件，适合替代默认的日期 + 标题格式，避免因标题修改导致链接失效。以下是详细的安装和配置步骤：
一、安装插件
在博客根目录（与 _config.yml 同级）打开终端，执行安装命令：

```bash
npm install hexo-abbrlink --save
```

![image-20251025161630706](https://cdnimg-doge.814925.xyz/file/hexo/img/1761380199459_image-20251025161630706.png)

## 三、使用 

### 修改config.yml文件中的permalink

注意这里修改的config.yml 不是主题的config.yml  注意这里修改的config.yml 不是主题的config.yml 

posts想怎么改都可以 自己喜欢,也就是也会文件

```Bash
permalink: posts/:abbrlink.html
```

![image-20251025161806138](https://cdnimg-doge.814925.xyz/file/hexo/img/1761380291426_image-20251025161806138.png)

###  添加插件配置

在 `_config.yml` 中新增 `abbrlink` 配置（放在任意位置，我直接放在最下面）：

```bash
# abbrlink 配置
abbrlink:
  alg: crc32  # 算法：crc16/32（默认）、md5（更长）
  rep: hex    # 输出格式：dec（十进制）、hex（十六进制，默认）
  # 可选：是否在文章 Front-matter 中显示 abbrlink 值（方便查看）
  show_link: true
```

![image-20251025162225288](https://cdnimg-doge.814925.xyz/file/hexo/img/1761380559403_image-20251025162225288.png)

然后保存预览一下会发现文章的头部abbrlink：自动生成了随机值了

![image-20251025162351293](https://cdnimg-doge.814925.xyz/file/hexo/img/1761380641376_image-20251025162351293.png)

网页预览效果

![image-20251025163732690](https://cdnimg-doge.814925.xyz/file/hexo/img/1761381462265_image-20251025163732690.png)