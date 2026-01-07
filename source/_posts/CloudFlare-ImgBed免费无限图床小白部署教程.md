---
title: CloudFlare-ImgBed免费无限图床小白部署教程
cover: 'https://imgteo.814925.xyz/file/hexo/img/1761377902349_Canvas-Ruom.webp'
categories:
  - 网站建设
tags:
  - 图床
  - Cloudflare
  - CloudFlare-ImgBed
abbrlink: 6af11725
date: 2025-10-26 16:25:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
---


基于 CloudFlare 的开源文件托管解决方案，支持 Telegram Bot、Cloudflare R2、S3 等存储渠道，实现低成本文件托管，简单说就是白嫖到底！

渠道类型：

1. Telegram Bot	完全免费、无限容量	大于20MB文件需分片存储 我们这里主要就是白嫖TG来储存，唯一现在就是单张图片不能大于20MB
2. Cloudflare R2	无文件大小限制、企业级性能	超出10G免费额度后收费，需要绑定支付方式
3. S3 兼容存储	选择多样、价格灵活	根据服务商定价
> 部署完成后进阶教程：[给免费图床加个速：CloudFlare-ImgBed 配置国内 CDN，实现免费 CDN 加速图床功能](https://www.yunsen2025.top/015-cloudflare-imgbed-fen-xian-pei-zhi-guo-nei-cdn/)


## 第一步：Fork 项目
访问 [CloudFlare ImgBed 项目](https://github.com/MarSeventh/CloudFlare-ImgBed)，点击右上角的 "Fork" 按钮，将项目 Fork 到自己的 GitHub 仓库。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375872061_asynccode)


## 第二步：创建 Pages 项目
### 1. 访问 Cloudflare Dashboard 关联仓库
登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，选择左侧菜单的 "Workers & Pages"，点击 "创建应用程序"，选择 "Pages" 选项卡，点击 "连接到 Git"，最终选择刚才 Fork 的项目。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375871115_asynccode)

### 2. 配置项目设置
- 项目名称：cloudflare-imgbed（或自定义）
- 生产分支：main（默认）
- 构建命令：`npm install` **重要：v2.0 新构建命令，旧版本构建命令不适用**
- 构建输出目录：/（默认）

**重要提醒**：v2.0 版本的构建命令已变更为 `npm install`，请务必确保填写正确，否则部署会失败。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375879155_asynccode)

### 3. 部署项目
点击 "保存并部署"，等待首次部署完成（约 2-3 分钟），部署成功后即可通过 Cloudflare 生成的临时域名访问。


## Cloudflare-ImgBed 中 KV vs D1 数据库配置对比
#### 核心配置与使用差异表
| 对比维度                | Cloudflare KV 数据库                          | Cloudflare D1 数据库                          |
|-------------------------|-----------------------------------------------|-----------------------------------------------|
| 配置难度                | 极低，项目默认适配，仅绑定 KV 命名空间即可用   | 较高，需手动建库/表、修改代码适配 SQL 语句     |
| 每日免费核心额度        | 写入/删除/列出：各 1000 次；读取：10 万次     | 写入：10 万行；读取：500 万行                 |
| 超额度后上传/访问影响   | 图片可正常上传、访问（文件存 R2/Telegram）    |图片可正常上传、访问（文件存 R2/Telegram |
| 超额度后后台管理影响    | 超出 1000 次写入：新上传图片无法在后台查看/删除/管理 | 仅极端场景（日传超 10 万张）才会超额度，新上传图片无法在后台查看/删除/管理 |


#### 核心使用场景与选型建议
1. **优先选 KV 的场景（90% 个人用户）**
   - 核心诉求：仅作为图床使用，能正常上传/访问图片即可，后台管理（查看/删除）非核心需求；
   - 优势：配置最简单、上传/访问速度极快、支持大文件，即便单日上传超 1000 张：
     - ✅ 图片仍可正常上传、访问（文件实际存在 R2/Telegram）；
     - ❌ 仅超出 1000 张的部分无法在后台查看/删除，对纯图床使用几乎无影响；
   - 适配性：单日上传超 1000 张后，后台管理已无实际意义（手动管理 1000+ 张图片本身效率极低），完全契合“纯图床”定位。

2. **选 D1 的场景（小众需求）**
   - 核心诉求：需在后台批量筛选/统计图片（如“按日期筛选上传记录”“统计各存储渠道图片数量”）；
   - 优势：额度极高（日写入 10 万行），几乎不会触发超限额，支持数据回溯恢复；

#### 关键结论
- 若仅把 Cloudflare-ImgBed 当“纯图床”用（核心是传图/访问，后台管理可有可无），**KV 是最优解**：配置简单、速度快、支持大文件，超 1000 次仅影响后台管理，不影响核心功能；
- 若需高频在后台管理/统计图片，且仅传小文件，可选择 D1，但需接受配置复杂


## 第三步：配置数据库（必需）
数据库用于存储文件元数据，是项目运行的核心组件，可选 `KV` 数据库和 `D1` 数据库。由于 KV 数据库配置更简单，此处以 KV 数据库为例（可理解为用于储存配置文件和文件关联数据）。

### 1. KV 数据库配置：创建 KV 命名空间
1. 在 Cloudflare Dashboard 中选择 "存储和数据库"，点击 "KV"，再点击 "创建命名空间"
2. 输入命名空间名称：`img_url`（建议使用此名称，后续绑定需对应一致）

![img](https://imgteo.814925.xyz/file/hexo/img/1761375872204_asynccode)
![img](https://imgteo.814925.xyz/file/hexo/img/1761375872358_asynccode)

> 注意：若你不使用 R2 存储渠道，可跳过下方 R2 渠道配置步骤。

### 2. R2 渠道配置（可选）
进入 Cloudflare "R2 对象存储" 页面，点击 "创建存储桶"，存储桶名称可自定义（示例中使用 `img-r2`），按提示完成创建即可。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375872364_asynccode)


## 第四步：Telegram（电报）设置
### 1. 逻辑和原理
简单来说，就是在 Telegram 中创建一个专属频道，将机器人添加为频道管理员，后续上传的文件会自动存储到该频道中，实现无限免费存储扩容。

### 2. 添加机器人
1. 打开 Telegram，搜索 [@BotFather](https://t.me/BotFather)，向其发送 `/newbot`，按提示给机器人起一个名称（需以 Bot 或 -bot 结尾，且不能与现有机器人重名，重复会有提示），创建成功后记录机器人的 API Token（后续需用到）。


     /newbot 回车发送。
     
     botfarther会反馈
Alright, a new bot. How are we going to call it? Please choose a name for your bot.

    输入你要创建的bot名字。例如peiqi123_bot,回车发送

    它会反馈 Good. Now let's choose a username for your bot. It must end in `bot`. Like this, for example: TetrisBot or tetris_bot.

    我再输入 peiqi123_bot。这是这个机器人的名字。

    它会反馈Done! Congratulations on your new bot. You will find it at******


![img](https://imgteo.814925.xyz/file/hexo/img/1761375886861_asynccode)

2. 新建一个 Telegram 频道（名称自定义），将刚才创建的机器人拉进频道并设为管理员：点击频道设置中的 "添加管理员"，输入机器人名称并完成授权。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375880247_asynccode)

3. 在频道内随便发送一条消息，将该消息转发到 [@VersaToolsBot](https://t.me/VersaToolsBot)，机器人会返回频道的详细信息，记录其中的频道 ID（后续需用到）。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375885667_asynccode)

### 3. 整理需要的 KEY
到这里 Telegram 配置步骤完毕，需保存以下两个关键信息：
- TG_BOT_TOKEN = 刚才记录的机器人 API Token（示例：8211313561:AAGBK1_BBFfdsdfdsa4VKfdfsdsyyXeQLL9_OK5-s）
- TG_CHAT_ID = Telegram 机器人返回的频道 ID（示例：-1004545450980）


## 第五步：绑定 KV 数据库和 R2 对象存储
1. 返回已创建的 Pages 项目，选择 "设置" → "绑定"
2. 绑定 KV 数据库：变量名填写 `img_url`，选择之前创建的 KV 命名空间
3. （若配置了 R2）绑定 R2 对象存储：变量名填写 `img_r2`，选择之前创建的 R2 存储桶

![img](https://imgteo.814925.xyz/file/hexo/img/1761375886124_asynccode)


## 第六步：重新部署
由于修改了数据库和存储配置，需要重新部署使设置生效：
1. 进入 Pages 项目的 "部署" 页面
2. 找到最新的部署记录，点击右侧的 "..." 菜单，选择 "重试部署"
3. 等待部署完成后，通过 Cloudflare 提供的临时域名即可访问项目（也可后续绑定自己的自定义域名）


## 第七步：必须设置（系统初始化）
### 1. 进入后台设置
访问部署后的项目页面，点击网页右下角的 "设置"，再点击 "系统设置"（首次进入无需密码，直接即可进入）。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375886560_asynccode)

### 2. 上传设置：配置 Telegram 存储渠道
在 "系统设置" 中找到 Telegram 相关配置项，将第四步记录的 `TG_BOT_TOKEN` 和 `TG_CHAT_ID` 填入对应位置，点击 "保存设置"。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375886447_asynccode)
### 3. 其他关键设置
安全设置（设置管理员账号密码，防止他人篡改配置）、上传设置（选择默认存储渠道、设置文件大小限制等），可参考官方文档说明进行个性化配置。

![img](https://imgteo.814925.xyz/file/hexo/img/1761375884565_asynccode)
![img](https://imgteo.814925.xyz/file/hexo/img/1761375892456_asynccode)


### ⚠️ 重要提醒：关闭图像审查功能可大幅提升图片上传速度

若您遇到图片上传缓慢的问题，请注意**图像审查功能**的关键影响：

- **开启状态**：图片从上传到返回链接耗时**30秒以上**，严重拖慢操作效率；

- **关闭状态**：上传耗时可缩短至**5秒内**，体验流畅高效。

此问题曾困扰我多时，最终咨询作者后才确认根本原因。**若您无需图像审查功能，建议关闭**，以获得更顺畅的使用体验。
![image.png](https://imgteo.814925.xyz/file/waline/1765187953308_image.png)

![image.png](https://imgteo.814925.xyz/file/waline/1765187298678_image.png)


## 🤔进阶方案

1. 访问图片可以通过套CDN来进行加速，可以看进阶教程：[给免费图床加个速：CloudFlare-ImgBed 配置国内 CDN，实现免费 CDN 加速图床功能](https://hexo.814925.xyz/posts/6af1456/)

## ⚠️ 须知
技术说明：本文图片存储依赖 CloudFlare-ImgBed 图床服务，结合多吉云 CDN 加速。