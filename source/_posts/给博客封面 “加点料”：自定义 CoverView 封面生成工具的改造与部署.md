---
abbrlink: acd80ac1
title: 给博客封面 “加点料”：自定义 CoverView 封面生成工具
cover: 'https://i.p-i.vip/133/20251120-691ebf73edfde.png'
categories:
  - 网站建设
tags:
  - 腾讯云EdgeonePages
  - 封面
date: 2025-11-22 15:10:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
--- 


# 给博客封面 “加点料”：自定义 CoverView 封面生成工具


  最初被 [清羽飞扬大佬分享的 CoverView 项目](https://blog.liushen.fun/posts/cb179d4/) 吸引，它的界面风格简约大气，很适合技术博客的调性。但美中不足的是，这个版本**缺少本地图片上传功能**—— 询问后得知是因无需求所以没有写。。。。。

   ![1763521665120.png](https://i.p-i.vip/133/20251119-691d3489812d0.png)

   在文章中推荐了另外一个汉化分支 [Lruihao 汉化分支](https://github.com/Lruihao/CoverView)，它保留了本地图片上传功能，虽然我更加喜欢大佬的这个风格，但是我不会改上传。。。。

## 🔥改造思路：抄出个性化

我的目标很明确：**保留的优雅样式，同时加入本地图片上传功能**
不会写还不会抄吗，很多代码我都不敢删除，只能注释掉我发现我既然对不齐代码导致报错哈哈！为了方便像我这样的小白进行自定义部署，我就将所以可以改的文字和连接全部写到了 `config.ts`，这样只需要去修改这个文件就好了。

- **样式复刻**：直接参考清羽飞扬版本的界面布局、配色逻辑，让视觉风格保持一致；其实我也想加一行那个标题小字的，但是最后我失败了。

  ![清羽飞扬样式](https://i.p-i.vip/133/20251119-691d3add56557.png)

- **配置中心化**：将所有可自定义内容（页面标题、版权信息、GitHub 链接等）集中到根目录 `config.ts` 中，后续修改只需维护这一个文件，大幅降低个性化成本。为我这样小白方便直接修改使用；

## 🎨部署CoverView后效果

本站所有文章均采用了该项目生成封面，本站自部署地址如下：

野猪佩奇弟弟の封面生成：https://cover.814925.xyz

![1763521859571.png](https://i.p-i.vip/133/20251119-691d354a85116.png)

![1763521892504.png](https://i.p-i.vip/133/20251119-691d35976264a.png)

## 📦 API 说明

项目依赖 Unsplash API 提供图片资源，使用前需注意：

1. 需在环境变量中配置 `REACT_APP_UNSPLASH_ACCESS_KEY`（支持通过 `.env` 或系统环境变量设置）
2. API 调用限制：Unsplash 免费计划默认**每小时最多 50 次请求**，超过限制会导致图片加载失败
3. 若无需图片功能或遇到限制，可在代码中注释相关调用逻辑

## 🔑 API 配置（必看）

项目依赖 Unsplash API 实现图片搜索功能，需先配置环境变量：

1. **获取 API 密钥**

   访问 [Unsplash Developers](https://unsplash.com/developers)，按以下步骤操作：

   - 右上角注册账号并登录
   - 点击「New Application」创建应用
   - 进入应用详情页，获取 `Access Key` 

2. **配置环境变量**

   部署时需填入以下环境变量：

   - `REACT_APP_UNSPLASH_ACCESS_KEY`：对应 Unsplash 的 `Access Key`



## ✨ 功能优化

在原项目基础上，本分支主要做了以下调整：
1. 精简首页结构，移除冗余页面，聚焦核心功能
2. 底部新增版权信息与"关于本站"入口，支持自定义跳转链接
3. 实现配置集中化管理：所有可自定义的文字（标题、版权信息等）和链接均统一维护在 `config.ts` 中，修改无需改动业务代码


## 🔧 配置说明

所有可自定义内容均在根目录 `config.ts` 中维护，主要包括：
- 页面标题、头部文字等展示文本
- 底部版权所有者、跳转链接
- "关于本站"文字及链接
- GitHub仓库地址等

  ![1763522857656.png](https://i.p-i.vip/133/20251119-691d392f48930.png)

示例配置片段：
```typescript
// config.ts 关键配置示例
export default {
  headerTitle: "自定义封面生成",       // 头部标题
  copyrightOwner: "你的名称",          // 版权所有者
  ownerUrl: "https://你的网站",        // 所有者链接
  githubRepoUrl: "https://你的仓库地址" // 项目仓库链接
  // 更多配置详见文件
};
```

## 🚀 部署方式

支持多种现代化部署平台：

- Vercel
- Cloudflare Pages
- EdgeOne Pages
- 其他支持静态站点部署的平台

## ⚡CDN赞助

本项目 CDN 加速及安全防护由 Tencent EdgeOne 赞助：EdgeOne 提供长期有效的免费套餐，包含不限量的流量和请求，覆盖中国大陆节点，且无任何超额收费，感兴趣的朋友可以去 EdgeOne 官网获取 [最佳亚洲 CDN、Edge 和安全解决方案 - 腾讯 EdgeOne ![img](https://edgeone.ai/media/34fe3a45-492d-4ea4-ae5d-ea1087ca7b4b.png)](https://edgeone.ai/zh?from=github)


## 🌟 致谢


- [Rutik Wankhade](https://github.com/rutikwankhade)（原始 CoverView 项目）
- [Lruihao](https://github.com/Lruihao)（CoverView 汉化版本）
- [willow-god](https://github.com/willow-god)（~~抄~~参清羽飞扬版本的优化思路）
- Unsplash 社区的摄影师们（提供无版权优质图片资源）
- [白雾林's Picbed图床](https://www.baiwulin.work)（感谢大佬提供的免费图床）

## ⚠️ 须知

技术说明：本文图片存储依赖白雾林's Picbed图床