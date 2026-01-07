---
title: 基于 Cloudflare Workers自建代理节点
cover: 'https://imgteo.814925.xyz/file/peiqi-uploads/1767759765556_cover_730598.png'
categories:
  - 网站建设
tags:
  - 自建节点
  - Cloudflare
abbrlink: d26acfdd
date: 2026-01-07 12:49:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
---
基于 Cloudflare Workers自建代理节点，教程参考YouTube老王

unning VLESS + trojan + shadowsocks on cloudflare workers and snippets..........在workers或snippets上部署vless/trojan/shadowsocks代理节点，主流客户端一键订阅

- 🚀 基于 Cloudflare Workers 和 snippets 的高性能代理
- 🌐 vless + trojan 双协议支持
- 🔐 密码保护的主页访问
- 📱 支持多种客户端(v2rayN,shadowrocket,loon,karing,clash,sing-box等)
- 🌐 自动故障转移和负载均衡
- 📊 实时连接测试和状态监控
- 📊 默认禁用speedtest测速

项目地址：https://github.com/eooce/Cloudflare-proxy

# Shadowsocks 订阅中心

此内容仅供学习、测试场景参考，不确保实际使用中的有效性与可靠性

https://ss.wangrui.dpdns.org

UUID在 Cloudflare Workers里面可以修改

订阅地址 加**UUID** 进入订阅中心

https://ss.wangrui.dpdns.org/361c94a8-8903-4cff-9ab7-0732882e596a

节点包含

SG （**新加坡**）、 HK（中国香港）、TW(中国台湾)、JP（日本） 这个几个节点。

Clash Party配置

个人习惯使用Clash

软件下载地址:https://github.com/mihomo-party-org/clash-party/releases/tag/v1.8.9

这里的代理组里面记得修改一下国内服务改成DIRECT（直连的意思）可能默认会是节点选择，这样会导致访问国内服务也是走的节点。

![image (1).png](https://imgteo.814925.xyz/file/peiqi-uploads/1767759790688_image__1_.png)

# 实际测速
当做备用节点使用完全没有问题，又不用担心流量其实还是不错的。
