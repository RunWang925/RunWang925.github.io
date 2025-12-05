---
title: '腾讯云EdgeonePages部署hexo博客教程,免费好用快速,国产版Cloudflare，和CF速度对比'
cover: 'https://bitiful.814925.xyz/2024/11/20/202411201126025.jpg'
swiper_index: 10
top_group_index: 10
background: '#fff'
tags:
  - hexo
  - EdgeonePages
  - Cloudflare
categories:
  - 教程分享
abbrlink: 7a176405
date: 2024-11-14 16:25:49
updated:
keywords:
description:
top:
top_img:
comments:
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
ai:
---
# 前言
EdgeOne是腾讯推出的边缘安全加速平台，提供内容分发和安全防护服务。而Pages就是这个平台上的静态网站托管服务，支持一键部署，自定义域名，免费https，简直不要太香！

# 准备工作

腾讯云Edgeone注册 分为国际版和国内版，区别如下根据你实际需求来进行注册吧。

腾讯云国际版：https://edgeone.ai/

腾讯云国内版：https://console.cloud.tencent.com/edgeone

| Pages        | 实名 | 域名是否需要备案 | CDN服务器数量（理论数量越多越好） | 访问速度 |
| ------------ | ---- | ---------------- | --------------------------------- | -------- |
| 腾讯云国内版 | √    | √                | 70+                               | 0.5s     |
| 腾讯云国际版 | ×    | ×                | 10+                               | 1s-3s    |
| Cloudflare   | ×    | ×                | 4                                 | 1s-3s +  |

Cloudflare和腾讯云国际版 可以绑定不备案的域名。更加适用于白嫖。腾讯云国际版和国内版本的操作基本一致，下面就以国内版为例

注意：腾讯云国际版有提示绑定信用卡（外币）可以体验完整服务，不知道绑定和不绑定信用卡的区别。

# 腾讯云国内版

1. 已注册腾讯云账号，并完成实名认证，有关实名认证的介绍请参见 [实名认证基本介绍](https://cloud.tencent.com/document/product/378/3629)。
2. 准备一个已注册可用于接入的站点域名，例如：814925.xyz。有关域名注册的介绍请参见 [域名注册流程介绍](https://cloud.tencent.com/document/product/242/49743)。

3.GitHub账号，需要将博客静态文件上传到仓库。

参考前面写的hexo博客教程，前面所有步骤一样。

**简单说就是将原来Cloudflare Pages替换为了腾讯的Edgeone Pages。因为腾讯在国内访问速度肯定更快！因为在国内嘛所以域名备案肯定是必须的**

**注意：**

如果您需要接入的站点服务区域为中国大陆可用区或全球可用区，需要该域名已在工信部完成域名备案。有关域名备案的介绍请参见 [域名备案流程](https://cloud.tencent.com/document/product/243/18905)。

# 开通EdgeOn

确认完成以上准备工作后，即可开始接入至 EdgeOne 。

1. 登录 [EdgeOn控制台](https://console.cloud.tencent.com/edgeone)。https://console.cloud.tencent.com/edgeone

第一次登录可能需要点击一下免费开通。选择下面的Pages

![img](https://bitiful.814925.xyz/2024/11/20/202411201127413.png)

第一次点击需要绑定github账号

![img](https://bitiful.814925.xyz/2024/11/20/202411201127275.png)

点击创建项目，现在我们绑定的Github账号，选择我们hexo博客仓库。这里选择自己的博客仓库

![img](https://bitiful.814925.xyz/2024/11/20/202411201127294.png)

项目名称自己写一个，然后点击开始部署

![img](https://bitiful.814925.xyz/2024/11/20/202411201127420.png)

 速度非常快可能十几秒就好了

![img](https://bitiful.814925.xyz/2024/11/20/202411201127370.png)

然后点击预览，给出了一个三个小时的临时链接。

![img](https://bitiful.814925.xyz/2024/11/20/202411201127393.png)

然后点击项目设置添加自定义域名

![img](https://bitiful.814925.xyz/2024/11/20/202411201127142.png)

然后自定义域名，到对应域名服务商添加记录即可完成域名绑定

![img](https://bitiful.814925.xyz/2024/11/20/202411201127332.png)

可以对比测试一下 看看是

# Cloudflare Pages和Edgeone Pages测速

1.使用网站测速在线工具https://www.itdog.cn/选择网站测速。两次测试最好间隔过**十分钟半小时**的再测，只能测一次，你测一次之后DNS就会被运营商缓存，要等这样测试才比较准确。我的测试并不严谨，仅供自己参考。

2.使用的都是相同的github仓库博客，使用都是同一个域名提供商，分别解析三个不同域名进行测试。

## 腾讯云Edgeone Pages测试（国内版）

可能是刚开始推，使用的人比较少，在国内大部分地区都可以达到0.5s以内。然后下面的域名解析统计的cdn既然有75个地址，不清楚 我小白，理论是越多越。

![img](https://bitiful.814925.xyz/2024/11/20/202411201141793.png)

## 腾讯云Edgeone Pages测试（国际版）

可能是刚开始推，使用的人比较少，在国内大部分地区都可以达到1s-3s以内。然后下面的域名解析统计的cdn10个地址，不清楚 我小白，理论是越多越。

![img](https://bitiful.814925.xyz/2024/11/20/202411201142444.png)

## Cloudflare Pages测试

我使用了很久了，测试可以导出来普遍访问速度都在1s-3s。这次测试还算是比较好的结果了，到高峰期的时候满红。然后下面的域名解析统计的cdn只有5个地址，不清楚 我小白，理论是越多越好。不过他不需要备案，加上优选IP应该可以更加快。白嫖才是王道。

![img](https://bitiful.814925.xyz/2024/11/20/202411201143175.png)

# 总结：

腾讯云国内版访问速度最快，但是域名需要备案才能使用（我都备案肯定有服务器，我放我服务器应该更加快吧）

如果域名没有备案，可以使用你正在使用`CloudflarePages`和`腾讯云Edgeone Pages`国际版，个人测试感觉腾讯云Edgeone Pages国际比CloudflarePages访问速度要快。

## ⚠️ 须知
技术说明：本文图片存储依赖缤纷云（Bitiful）对象存储。之前莫名被扣了几分钱，导致服务无法访问，后续充值最低 10 元后已恢复正常使用。