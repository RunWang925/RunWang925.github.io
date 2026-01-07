---
abbrlink: 4f2ff2ea
title: Waline 评论系统自定义图床：HEXO框架，Solitude 主题评论三方图床的折腾记 
cover: 'https://i.p-i.vip/133/20251130-692bc7cc0d637.png'
categories:
  - 网站建设
  - 教程分享
tags:
  - Solitude
  - Waline
  - CloudFlare-ImgBed
  - 评论系统

date: 2025-11-30 12:10:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
--- 


在 Hexo 博客用 Solitude 主题时，Waline 评论系统确实香得很 —— 能实时聊两句、能甩表情包，还能直接传图片。但默认设置下，这货居然把图片塞到 LeanCloud 数据库里，这就有点坑了：

1. \*\* storage 告急 \*\*：LeanCloud 免费版就 1G 空间，图片攒多了分分钟爆满，而且单张还限 128KB，稍微清晰点的图都传不上去，跟便秘似的；

2. \*\* 链接太丑 \*\*：LeanCloud 返回的图片链接长得跟乱码似的，既影响观感又拉低评论体验。

这不，我就自己瞎折腾了一通，从「部署 Waline 评论系统」到「配置 Solitude 主题」再到「勾搭第三方图床」，总算把图片上传的活儿给外包出去了（以 CloudFlare ImgBed、白雾林's Picbed 为例）。过程嘛，说难不难说易不易，记录下来给各位参考参考，说不定能少踩点坑。

## 一、前置任务：给 Waline 搭个窝（Vercel + LeanCloud 组合拳）

先得把 Waline 的核心架子搭起来，保证能正常评论（图片上传的事儿后面再改）。

### 1.1 给 LeanCloud 做点初始化（数据库当后盾）

Waline 得靠 LeanCloud 存评论数据（用户名、内容、时间这些），图片后面再分流到第三方图床，这儿先把基础数据库弄好：

1. 去 [LeanCloud 国际版](https://console.leancloud.app/) 注册登录（国内版要备案，国际版香多了）；

2. 进应用，点左下角 `设置` > `应用 Key`，就能看到 `APP ID`、`APP Key` 和 `Master Key` 了，记下来，后面有用。

   ![1764475377880.png](https://i.p-i.vip/133/20251130-692bc1f53eb2d.png)

### 1.2 让 Vercel 托管 Waline 服务端

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)Vercel

1. 点上面那按钮，跳去 Vercel 部署服务端。


2. 起个自己喜欢的项目名，点 `Create` 继续：

    ![1763949526072.png](https://i.p-i.vip/133/20251124-6923bbdcf2944.png)

3. 等部署完，进项目「Settings → Environment Variables」，加这几个环境变量（都是 LeanCloud 那儿来的）。`LEAN_ID`、`LEAN_KEY` 和 `LEAN_MASTER_KEY` 这仨，值分别对应 LeanCloud 的 `APP ID`、`APP KEY`、`Master Key`。

|变量名|取值来源|说明|
|---|---|---|
|`LEAN_ID`|LeanCloud 应用 AppID|应用唯一标识|
|`LEAN_KEY`|LeanCloud 应用 AppKey|应用密钥|
|`LEAN_SERVER`|LeanCloud 服务器地址|数据请求地址|

![1764475411360.png](https://i.p-i.vip/133/20251130-692bc2180f00d.png)

1. 域名绑定（这步必须做）

Vercel 的域名在国内多数地方直接被墙，不绑自己的域名基本用不了，别问我怎么知道的。

1. 点顶部 `Settings` - `Domains` 进域名配置页

2. 输要绑定的域名，点 `Add`

    在域名服务器商那儿加条 `CNAME` 解析记录，我用的 cloudflare，还开了小黄云，国内访问就顺畅多了。

3. 等生效后，就能用自己的域名访问啦🎉

    - 评论系统：[https://waline.zoerun.qzz.io](https://waline.zoerun.qzz.io)

    - 评论管理：[https://waline.zoerun.qzz.io/ui](https://waline.zoerun.qzz.io/ui)

## 二、给 Solitude 主题指指路：启用 Waline 评论系统

基础架子搭好后，得让 Solitude 主题知道要用 Waline 评论，保证基本功能能跑起来。

### 2.1 改改主题配置文件

打开 Hexo 博客根目录下的 `_config.solitude.yml`（主题配置文件），找到「评论系统」那块，改成这样：

```yaml

# 评论系统配置
comment:
  # 用哪个评论系统（比如： waline or waline,twikoo）
  use: waline # waline, twikoo, valine, artalk, giscus # 
  # 这儿就选 waline 啦
```

### 2.2 看看基础功能能不能用

改完配置，执行 `hexo clean && hexo g && hexo s` 启动本地博客，随便点开一篇文章，要是能看到 Waline 评论框（还带「图片」上传按钮），说明基础配置成了。可以发个文字评论、传张图试试水。

不过这会儿点图片上传，还是会存到 LeanCloud 里，接下来就是重头戏 —— 改上传逻辑，让图片去第三方图床安家。

## 三、核心操作：改 Waline.pug 文件，让图片上传换条道

Solitude 主题的 Waline 评论组件代码在 `themes\solitude\layout\includes\widgets\third-party\comments\waline.pug` 里，咱要改的就是这文件里的 `imageUploader` 配置，把图片上传的活儿交给第三方图床的接口。其他主题的话，就得自己摸索着来了，原理差不多。

![1764475641465.png](https://i.p-i.vip/133/20251130-692bc303450aa.png)



### 3.1 思路很简单

Waline 支持自定义 `imageUploader` 函数，这函数接收「图片文件对象」，返回「图片在线链接」就行。咱只要照着目标图床的 API 文档，写段上传代码，替换掉默认的 LeanCloud 上传逻辑就行。



### 3.2 两种图床适配示例（直接抄作业就行）

下面是「CloudFlare ImgBed（开源自建还免费）」和「白雾林's Picbed（大佬提供）」的完整修改代码，挑一个用就行。

#### 3.2.1 勾搭 CloudFlare ImgBed 图床

CloudFlare ImgBed 是开源免费的自建图床（基于 CloudFlare Workers + R2），接口简单，还没存储限制，适合长期用。

先得确保你已经部署了 CloudFlare ImgBed（部署教程看 [官方文档](https://cfbed.sanyue.de/)，或者参考我之前瞎折腾的文章[CloudFlare-ImgBed 免费无限图床小白部署教程](https://hexo.814925.xyz/posts/6af11725/)）

改 `waline.pug` 文件，加一下或者改一下 `imageUploader` 字段：

imageUploader 说明

要是你图床搭好后没设密码，也不用改下面的 API 参数，保持默认就行。

只需要改上传接口 URL 和返回的接口。

```Plain Text

// 【得改】换成你的图床实际上传接口 URL
const uploadUrl = new URL('https://img.814925.xyz/upload');
// 要是返回相对路径（比如"/file/xxx.jpg"），就拼接上图床域名（像下面这样）
const fullUrl = `https://img.814925.xyz${resp[0].src}`;
```

如果要自定义参数，具体可以参考官方文档的[上传 API](API说明)

|参数名|类型|必需|默认值|说明|
|---|---|---|---|---|
|`authCode`|string|否|-|上传认证码|
|`serverCompress`|boolean|否|`true`|服务端压缩（只针对 Telegram 渠道的图片文件）|
|`uploadChannel`|string|否|`telegram`|上传渠道：`telegram`、`cfr2`、`s3`|
|`autoRetry`|boolean|否|`true`|失败时自动切换渠道重试|
|`uploadNameType`|string|否|`default`|文件命名方式，可选 `[default, index, origin, short]`，分别是默认`前缀_原名`、`仅前缀`、`仅原名`和`短链接`命名法|
|`returnFormat`|string|否|`default`|返回链接格式，可选 `[default, full]`，分别是默认的`/file/id`格式、完整链接格式|
|`uploadFolder`|string|否|-|上传目录，用相对路径，比如传到 img/test 目录就填`img/test`|
比如我觉得常用的参数就是密码、路径、渠道

上传官方说可以用密码或者 Token，不过我技术渣，试了好几次都没搞定，用了 Token 就没法用下面的路径和渠道参数。最后我就用了密码上传，哪位大佬知道咋弄的，求指点，还是 Token 靠谱，能和密码分开。

参数用法

uploadUrl.searchParams.set (' 参数名 ', ' 默认值);

举个栗子

1. 我设了上传认证码是 admin123，那上传参数就是这样

2. 上传目录是 waline

3. 图床渠道是 R2 储存（`telegram`、`cfr2`、`s3`）

```Plain Text

// 固定字段：上传的文件（和图床 API 的 form 字段保持一致，不用改）
formData.append('file', file);

// 【得改】换成你的图床实际上传接口 URL，填自己的图床地址加 /upload
const uploadUrl = new URL('https://img.814925.xyz/upload');
// 下面的参数根据自己需求，参考官方 API 说明加，没自定义参数就直接删了这几行


1.// 【按需改】图床认证参数（不用认证就删了；要认证就把 'peiqi' 换成你的密码）
uploadUrl.searchParams.set('authCode', 'peiqi'); 

2.// 【按需改】图床目录参数（用来分类存储，不用分类就删了；要分类就把 'waline' 换成你的目录名）
uploadUrl.searchParams.set('uploadFolder', 'waline'); 

3.// 【按需改】图床渠道参数（用来标识来源，不用就删了；要用就把 'cfr2' 换成你的渠道名）
uploadUrl.searchParams.set('uploadChannel', 'cfr2'); 

return fetch(uploadUrl.toString(), {
method: 'POST',
body: formData,
mode: 'cors',
})
.then(resp => {
if (!resp.ok) throw new Error(`上传失败：${resp.status}`);
return resp.json();
})
.then(resp => {
// 【没啥特殊需求就不用改】根据图床返回的 src 格式拼完整 URL
// 要是返回完整 URL（比如"https://xxx.com/xxx.jpg"），直接 return resp[0].src;
// 要是返回相对路径（比如"/file/xxx.jpg"），就拼接上图床域名（像下面这样）
const fullUrl = `https://img.814925.xyz${resp[0].src}`;
return fullUrl;
```

下面是完整代码，三行自定义参数不用的话，直接删了或者注释掉就行

```pug

- const { envId, option ,pageview } = theme.waline
- const { lazyload, count, commentBarrage,use } = theme.comment

#waline-wrap(comment_id=page.comment_id)

script.
    (() => {
        let walineInitFunction = window.walineFn || null

        function initWaline(initFn) {
            const walineOptions = {
                el: '#waline-wrap',
                serverURL: '!{envId}',
                pageview: !{pageview},
                dark: 'html[data-theme="dark"]',
                path: window.location.pathname,
                comment: !{count},
                // 图片上传逻辑（下面是重点配置）
                imageUploader: (file) => {
                    if (!file) throw new Error('请选择图片');
                    const formData = new FormData();
                    formData.append('file', file); // 固定字段：上传的文件（和图床 API 的 form 字段保持一致，不用改）
                    
                    // 【得改】换成你的图床实际上传接口 URL
                    const uploadUrl = new URL('https://img.814925.xyz/upload');
                    
                    // 【按需改】图床认证参数（不用认证就删了；要认证就把 'peiqi' 换成你的密码）
                    uploadUrl.searchParams.set('authCode', 'peiqi'); 
                    
                    // 【按需改】图床目录参数（用来分类存储，不用分类就删了；要分类就把 'waline' 换成你的目录名）
                    uploadUrl.searchParams.set('uploadFolder', 'waline'); 
                    
                    // 【按需改】图床渠道参数（用来标识来源，不用就删了；要用就把 'cfr2' 换成你的渠道名）
                    uploadUrl.searchParams.set('uploadChannel', 'cfr2'); 
                    
                    return fetch(uploadUrl.toString(), {
                        method: 'POST',
                        body: formData,
                        mode: 'cors',
                    })
                        .then(resp => {
                            if (!resp.ok) throw new Error(`上传失败：${resp.status}`);
                            return resp.json();
                        })
                        .then(resp => {
                            // 【没啥特殊需求就不用改】根据图床返回的 src 格式拼完整 URL
                            // 要是返回完整 URL（比如"https://xxx.com/xxx.jpg"），直接 return resp[0].src;
                            // 要是返回相对路径（比如"/file/xxx.jpg"），就拼接上图床域名（像下面这样）
                            const fullUrl = `https://img.814925.xyz${resp[0].src}`;
                            return fullUrl;
                        })
                        .catch(err => {
                            console.error('图床上传错误：', err);
                            throw err;
                        });
                },
                ...!{JSON.stringify(option)}
            }
            const walineInstance = initFn(walineOptions)
            utils.addGlobalFn('pjax', () => walineInstance.destroy(), 'destroyWaline')
            GLOBAL_CONFIG.lightbox && utils.lightbox(document.querySelectorAll('#comment .wl-content img:not(.wl-emoji)'))
            sco.owoBig({
                body: '.wl-emoji-popup',
                item: '.wl-tab-wrapper button'
            })
        }

        async function loadWaline() {
            if (walineInitFunction) initWaline(walineInitFunction)
            else {
                await utils.getCSS('!{url_for(theme.cdn.waline_css)}')
                const {init} = await import('!{url_for(theme.cdn.waline_js)}')
                walineInitFunction = init || Waline.init
                initWaline(walineInitFunction)
                window.walineFn = walineInitFunction
            }
            !{commentBarrage} && barrageWaline()
        }

        if (!{use[0] === 'Waline'} || !{lazyload}) {
            if (!{lazyload}) utils.loadComment(document.getElementById('waline-wrap'), loadWaline)
            else loadWaline()
        } else window.loadTwoComment = loadWaline
    })()

if commentBarrage
    script.
        async function barrageWaline() {
            const url = new URL('!{envId}/api/comment')
            const params = {path: window.location.pathname, pageSize: 10&page: 1&lang: zh-CN&sortBy: insertedAtDesc}
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
            await fetch(url).then(async res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                const data = await res.json();
                const regex = /<img [^>]*class="wl-emoji"[^>]*>/;
                const init = () => {
                    initializeBarrage(data.data.data
                        .map(item => ({
                            nick: item.nick,
                            content: item.content.replace(regex, ''),
                            id: item.objectId
                        })))
                }
                if (typeof initializeBarrage === "undefined") await utils.getScript('!{url_for(theme.cdn.barrage_js)}').then(init)
                else init()
            }).catch(error => console.error("An error occurred while fetching comments: ", error))
        }
```

#### 3.2.2 勾搭 白雾林's Picbed 图床

白雾林's Picbed 是免费公共图床（[官网](https://picbed.baowulin.com/)），注册就送 100M 空间。非商业用户，人家还提供免费存储空间，不够了可以工单申请，我已经提交工单等某大佬审核了。

直接改 `waline.pug` 的 `imageUploader` 字段，用白雾林图床接口：

要是想用白雾林's Picbed 图床，下面就改俩参数

const uploadUrl = '[https://www.baiwulin.work/api/v1/upload](https://www.baiwulin.work/api/v1/upload)'; // 官方 api 没变的话，这行也不用改

'Authorization': 'Bearer 56|QdL8gpQonqX3Isg5f8tnR2xkOtPgd9HcXov7zpLt', // 你的图床 Token

下面是完整代码，直接复制替换，然后改自己的 Token 就行

```pug

- const { envId, option ,pageview } = theme.waline
- const { lazyload, count, commentBarrage,use } = theme.comment

#waline-wrap(comment_id=page.comment_id)

script.
    (() => {
        let walineInitFunction = window.walineFn || null

        function initWaline(initFn) {
            const walineOptions = {
                el: '#waline-wrap',
                serverURL: '!{envId}', 
                pageview: !{pageview},
                dark: 'html[data-theme="dark"]',
                path: window.location.pathname,
                comment: !{count},
                // 适配白雾林's Picbed 图床 注册地址https://www.baiwulin.work/
                imageUploader: (file) => {
                    if (!file) throw new Error('请选择图片');
                    const formData = new FormData();
                    formData.append('file', file);

                    const uploadUrl = 'https://www.baiwulin.work/api/v1/upload';

                    return fetch(uploadUrl, {
                        method: 'POST',
                        body: formData,
                        mode: 'cors',
                        headers: {
                            'Authorization': 'Bearer 56|QdL8gpQonqX3Isg5f8tnR2xkOtPgd9HcXov7zpLt', // 你的图床 Token 
                            'Accept': 'application/json'
                        },
                    })
                    .then(resp => {
                        if (!resp.ok) throw new Error(`上传失败：${resp.status}`);
                        return resp.json();
                    })
                    .then(resp => {
                        console.log('图床完整响应：', resp);
                        // 从 links.url 里提取完整图片 URL
                        const imgUrl = resp.data.links.url;
                        if (!imgUrl) throw new Error('没找到图片 URL 字段');
                        return imgUrl;
                    })
                    .catch(err => {
                        console.error('图片上传错误：', err);
                        throw err;
                    });
                },
                ...!{JSON.stringify(option)}
            }
            const walineInstance = initFn(walineOptions)
            utils.addGlobalFn('pjax', () => walineInstance.destroy(), 'destroyWaline')
            GLOBAL_CONFIG.lightbox && utils.lightbox(document.querySelectorAll('#comment .wl-content img:not(.wl-emoji)'))
            sco.owoBig({
                body: '.wl-emoji-popup',
                item: '.wl-tab-wrapper button'
            })
        }

        async function loadWaline() {
            if (walineInitFunction) initWaline(walineInitFunction)
            else {
                await utils.getCSS('!{url_for(theme.cdn.waline_css)}')
                const {init} = await import('!{url_for(theme.cdn.waline_js)}')
                walineInitFunction = init || Waline.init
                initWaline(walineInitFunction)
                window.walineFn = walineInitFunction
            }
            !{commentBarrage} && barrageWaline()
        }

        if (!{use[0] === 'Waline'} || !{lazyload}) {
            if (!{lazyload}) utils.loadComment(document.getElementById('waline-wrap'), loadWaline)
            else loadWaline()
        } else window.loadTwoComment = loadWaline
    })()

if commentBarrage
    script.
        async function barrageWaline() {
            const url = new URL('!{envId}/api/comment') // 和 Waline 服务端地址同步
            const params = {path: window.location.pathname, pageSize: 10, page: 1, lang: 'zh-CN', sortBy: 'insertedAtDesc'}
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
            await fetch(url).then(async res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                const data = await res.json();
                const regex = /<img [^>]*class="wl-emoji"[^>]*>/;
                const init = () => {
                    initializeBarrage(data.data.data
                        .map(item => ({
                            nick: item.nick,
                            content: item.content.replace(regex, ''),
                            id: item.objectId
                        })))
                }
                if (typeof initializeBarrage === "undefined") await utils.getScript('!{url_for(theme.cdn.barrage_js)}').then(init)
                else init()
            }).catch(error => console.error("An error occurred while fetching comments: ", error))
        }
```

### 3.3 改的时候注意点啥

1. 接口字段得对上：不同图床的接口接收的文件字段名可能不一样（比如 CloudFlare ImgBed 是 `file`，白雾林可能是 `image`），得照着图床 API 文档改 `formData.append` 的第一个参数；

2. 鉴权配置：要是图床需要 Token / 密钥鉴权（比如自建 CloudFlare ImgBed 设了访问密码），得在 `headers` 里加上对应的鉴权字段；

3. 错误处理：代码里加了异常捕获和提示，这样上传失败时，用户能知道咋回事，咱调试也方便。

## 四、最后检查：试试评论和图片上传

1. 执行 `hexo clean && hexo g && hexo s` 重新构建，启动本地博客；

2. 点开任意文章，填个昵称，输点评论内容，点「图片」按钮选张本地图片上传；

3. 要是图片能正常显示在评论框里，发出去后评论区也能看到，说明自定义图床配置成了；

4. 可以登 LeanCloud 后台看看 `Comment` 表，这会儿图片字段存的是第三方图床的短链接，不是 LeanCloud 原来那老长的链接了，存储压力一下就小多了。

## 总结

先是用「Vercel + LeanCloud」部署了 Waline 服务端，然后配置 Solitude 主题启用评论功能，最后改 `waline.pug` 里的 `imageUploader` 函数，成功把评论图片分流到第三方图床，LeanCloud 存储不够用和链接太丑的问题都解决了。

## ⚠️ 须知

技术说明：本文图片存储依赖白雾林's Picbed图床
