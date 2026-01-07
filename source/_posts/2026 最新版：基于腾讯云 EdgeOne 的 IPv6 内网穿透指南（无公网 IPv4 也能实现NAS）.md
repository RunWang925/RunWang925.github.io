---
title: 2026 最新版：基于腾讯云 EdgeOne 的 IPv6 内网穿透指南（无公网 IPv4 也能实现NAS）
cover: 'https://imgteo.814925.xyz/file/waline/1767759247163_cover_230877.png'
categories:
  - 网站建设
tags:
  - 内网穿透
  - 腾讯EdgeOne
abbrlink: 8133eb58
date: 2026-01-07 10:49:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
---


为一个爱折腾的宅，我在本地搭了 NAS，就想在外边随时访问，这时候就得搞内网穿透。之前陆续用过 zerotier、FRP、cloudflare 这些服务，但我家宽带只有 IPv6 公网地址，IPv4 还是内网 —— 直接用 IPv6 访问吧，又只能在支持 IPv6 的环境用，兼容性太差了。

用过 zerotier、FRP、Cloudflare 免费版（国内访问慢）、节点小宝（目前在用），看到网上大佬有使用腾讯云边缘计算 EO（EdgeOne）搭配 DDNS 动态域名解析，终于实现低成本穿透。今天分享完整方案，新手跟着步骤也能做。我使用的是免费版，需要域名备案。
教程参考 https://blog.leihub.cn/archives/899 

### 一、先搞懂：为什么腾讯云 EO+IPv6 方案能行？

- 在动手前，先理清核心逻辑，没有公网 IPv4，为什么 IPv6+EO 能实现穿透？
- 家庭宽带 IPv6 本身是公网地址，我们这个方法选择 EO 充当 “IPv4 转 IPv6 桥梁”，接收 IPv4 用户请求并转发到本地服务，同时解决 IPv6 地址动态变化（靠 DDNS）和兼容性问题。
  - 家庭宽带的 “痛点” 现在多数家庭宽带已支持 IPv6（光猫防火墙、路由器端口限制），但两个问题拦住多数人：
  - IPv6 地址是动态的（每次重启路由器会变），没法直接绑定域名；
  - 多数用户设备仍用 IPv4（酒店网络、公司网络），直接访问 IPv6 服务会失败。
  - 所需的工具
  - DDNS（动态域名解析）：解决 IPv6 地址动态变化问题，把 “变化的 IPv6” 和 “固定域名” 绑定（比如让 [http://hfs.814925.xyz](http://hfs.814925.xyz:8963/) 始终指向家里的 IPv6），是 IPv6 穿透的核心前提。
  - 腾讯云 EO：相当于 “中间桥梁”—— 接收 IPv4 用户的访问请求，转发到 IPv6 本地服务，同时提供 CDN 加速（国内节点，比 Cloudflare 快）。
  - 双域名设计：一个域名（A 域名[http://hfs.814925.xyz](http://hfs.814925.xyz:8963/) ）绑本地 IPv6（靠 DDNS），一个域名（B 域名[http://hfs1.814925.xyz](http://hfs.814925.xyz:8963/) ）做 EO 加速入口，解决 EO 不能直接绑动态 IPv6 的问题。

### 二、方案架构：一张图看懂流量走向

整个穿透流程其实很简单，用文字画个架构图：

```Bash
公网用户（IPv4/IPv6）
        ↓
腾讯云EdgeOne（加速域名/B域名：hfs1.814925.xyz）
        ↓
原始域名/A域名（hfs.814925.xyz:8963）
        ↓
本地HFS服务
```

简单说：用户访问 B 域名，EO 根据路径把请求转发到对应的本地服务，同时自动处理 IPv4 转 IPv6 的兼容问题。

### 三、前置准备：这些东西要先备好

动手前先确认资源是否齐全，避免中途卡壳：

1. 家庭 IPv6 环境：光猫、路由器开启 IPv6（登录路由器管理页，找 “IPv6 设置”，选 “原生 IPv6”），用 ipconfig（Windows）或 ifconfig（Linux）查本地 IPv6（开头通常是 240e、2409 等公网段）。
2. 常会遇到如路由器防火墙、光猫防火墙、端口映射等等问题。大部分人都会卡在这一步。
3. 域名：由于需要使用腾讯EdgeOne，域名需要备案。到这一步我估计已经有百分之90人已经被劝退了。比如用 hfs.814925.xyz（A 域名，绑本地 IPv6）和 hfs1.814925.xyz（B 域名，EO 加速入口）。
4. 腾讯云账号：开通 “边缘计算 EO” 服务（搜 “EdgeOne” 就能找到免费套餐基本都沟通了，如果觉得合适后面再考虑开通收费的套餐）白嫖党万岁！

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=NWNhNTNiNGNlN2U0Njc0NmIxY2UxYjYxNmRlODc2ZjNfbXRxUFFxYUZtWTRYV2dROUtyMWFhVUdZaTVrMnF1ZUVfVG9rZW46Rk11QWJCUEhFb1liaER4bklKU2NYb2pFbldnXzE3Njc3NTg5NDY6MTc2Nzc2MjU0Nl9WNA)

1. 本地服务：HFS服务确保局域网内用， IPv6 能访问（比如用 http://[240e:xxx:xxx:xxx] HFS服务）。NAS原理相同我这里不想使用NAS进行演示。
2. DDNS 工具：推荐开源的 ddns-go（跨平台，图形化界面，新手友好）。

### 四、分步操作：从 0 到 1 实现穿透

这部分是核心，每一步都附具体操作，跟着来就能成。DDNS 的搭建可以看之前写的一篇文章：[DDNS+IPV6 实现外网访问 - 阿雷的小窝](https://blog.leihub.cn/archives/535)

#### 第一步：配置 A 域名的 DDNS（让域名绑住动态 IPv6）

目标：让 hfs.814925.xyz  始终指向家里的 IPv6，哪怕地址变了也能自动更新。如果nas直接搜索安装更加简单

1. 下载安装 ddns-go：

- 官网：https://github.com/jeessy2/ddns-go，根据系统下载对应版本（Windows 选 exe，Linux 选 amd64.deb）。
- 打开软件，默认端口 9876，浏览器访问 [http://localhost:9876](http://localhost:9876/) 进入管理页。

1. 配置 DDNS 规则：

- 选择 “DNS 服务商”：比如你的域名在腾讯云，就选 “腾讯云 DNS”，然后去腾讯云控制台获取 “SecretId” 和 “SecretKey”（搜 “访问管理”→“API 密钥” 创建）。
- DDNS 类型选 IPV6，通过网卡获取 IP 地址，填指向本地的域名（即hfs.814925.xyz）；

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWNkOTMzYzNjNWZkMDMxOTRlZjJmZjdiZDhmNzc1ZTBfVHFzd2VLcndXSVJDcnFLT0pxUGgxemFVV1dpQXBSSllfVG9rZW46VE1aeGIyWnNQb3JmbEx4TWhHcGN4Rk9ibkhmXzE3Njc3NTg5NDY6MTc2Nzc2MjU0Nl9WNA)

1. 测试验证：

- 保存配置后，看 ddns-go 日志是否显示 “更新成功”，每隔半小时会自动更新域名解析，确保指向本地 IPV6 地址。

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=MjVlZmYyOTg5MDBjNGE3N2U5MGNiMzQ2YWUxYjJlMWNfQjdpOHhQQWp3a3pZU0JBanA5anN3NDVKU2pnOHd1WWJfVG9rZW46WElNbGJCbXRIb1BDNWp4TDEyZGNkZzFWblZnXzE3Njc3NTg5NDY6MTc2Nzc2MjU0Nl9WNA)

- 通过手机流量（V6环境下）访问hfs.814925.xyz：8963 可以正常打开服务

#### 第二步：创建腾讯云 EO 服务（B 域名做访问入口）

目标：让 `hfs1.814925.xyz`成为公网访问入口，同时转发请求到本地服务。

1. 开通 EO 并新建加速域名：

- 登录腾讯云控制台，搜 “EdgeOne” 进入控制台，新建 “站点”（选 “网站加速”）。
- 输入加速域名：`hfs1.814925.xyz`，然后 “下一步”。

1. 关键：源站配置（IPv6 穿透核心）
2.  核心提示：

- 源站类型必须选 “域名”（而非 IP），因为 IPv6 是动态的，选域名可通过 DDNS 自动更新
- 源站地址：填 A 域名 `hfs.814925.xyz`；
- 端口与协议：按需修改；我这里端口就是8963，协议是http
- IPv6 回源：必须开启（“协议设置”→勾选 “IPv6”），确保 EO 能访问 IPv6 源站；

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=MmI0NDE4MzhiYzkxNzVhOWZjYzcxMjE2YTFkODBmN2VfQ3lMek0wclBScTRwa3o0TklodHIwNlpLZElNS0plcW9fVG9rZW46UnNrT2JDU0Nvb2g5QlR4TlUwT2NEbDZZbkxkXzE3Njc3NTg5NDY6MTc2Nzc2MjU0Nl9WNA)

1. 配置 HTTPS（必须！现在公网访问都要安全）：控制台申请免费证书勾选一下就好了
2. 开启WebSocket,点击“站点加速”→“站点全局配置”→“网络优化”→WebSocket

有什么用途我不是很清楚，有的说不开启会导致无法访问，我开启和关闭好像都可以访问

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=MjY3MWFlN2VhMjlmOWFjYjkyY2ZlOGYxMTJiODc1ZmJfcllqak9CcElWODVHT1ZpaUt5cEFDTkh6Tm5LOXBnRzhfVG9rZW46TW03WGJYSmpTb1JvTE14YWdDZWNEQzlWbmVmXzE3Njc3NTg5NDY6MTc2Nzc2MjU0Nl9WNA)

### 第五步：测试验证（确保能正常访问）

配置完一定要多场景测试，确保 IPv4/IPv6 环境都能访问。

`https://hfs1.814925.xyz` 不需要加端口号都可以访问

关于实际测试效果和速度，可以看我另外一篇文章 [NAS 外网访问实操：腾讯云 EdgeOne IPv6 穿透（无公网 IPv4）部署与测速](https://hexo.814925.xyz/posts/2c634b61/)