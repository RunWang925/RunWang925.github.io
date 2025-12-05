---
title: 小白友好版部署全流程： Github Action 的友链状态检测完整教程
cover: 'https://i.p-i.vip/133/20251205-6932413c0f7cd.png'
categories:
  - 教程分享
tags:
  - Github
  - check-flink
  - Solitude
  - EdgeonePages
  - 主题魔改
abbrlink: ea5a9ce1
date: 2025-12-05 10:16:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
---


## 前言
最近逛各位大佬的博客，超羡慕人家友链上有个访问延时检测，看着特别有意思！直到刷到轻羽飞扬大佬的check-flink项目，心一横就想自己试试部署。结果作为纯小白，整整折腾了两天才搞定，中间踩了好多坑（哭唧唧）。

所以特意把过程记录下来，专门写给和我一样的博客小白看 —— 适配的是 Hexo 博客 + Solitude 主题哦～其实主要就两步走：

这个教程专门给像我一样的小白准备，适配 Hexo 博客 + Solitude 主题，核心分为两大步骤：
1. 先部署check-flink友链检测项目：它会生成友链的数据源，还能自动检测每个友链能不能正常访问、状态咋样；

2. 再把检测结果弄到咱们博客的友链页面上：这样就能显示出访问延迟、有没有反链这些实用信息啦！

## 一：部署 check-flink 友链检测项目
### 第一步：前置准备
1. 已经搭建好 Hexo 博客，并且能正常预览友链页面（我的友链配置文件路径是 `source/_data/links.yml`，你可以参考这个找自己的）。
2. 友链格式需符合以下规范（重点看注释说明）：
   ```
         - name: 野猪佩奇弟弟  # 友链名称
           link: https://hexo.814925.xyz/  # 友链网址
           avatar: https://hexo.814925.xyz/img/touxiangpq.png  # 头像地址
           descr: 记录让幸福可以翻阅  # 网站描述
           topimg: https://hexo.814925.xyz/img/siteshot.png  # 网站截图
           # 划重点：如果需要检测对方是否有你的反链，必须加下面这个参数
           linkpage: https://hexo.814925.xyz/links/  # 对方的友链页面地址（一般是link/links或friends/）
   ```
   刚开始不懂 `linkpage` 也没关系，先跳过，后面对比测试就明白了（我当初这里踩坑了，折腾了好久才懂～）。

### 第二步：编写 links.js 脚本（生成检测所需的 JSON 数据源）
#### 2.1 创建脚本文件
在你的 Hexo 博客**根目录**（能看到 `source`、`themes` 文件夹的目录）新建 `links.js` 文件，复制以下代码：
```JavaScript
// 引入依赖（需先安装 yamljs）
const fs = require('fs');
const yaml = require('yamljs');

// 读取友链配置文件（修改为你的 links.yml 路径）
const linksData = yaml.load('./source/_data/links.yml');
let ls = [];

// 遍历分类，读取前4个分类的友链（j可自定义）
// j=linksData.links.length 读取所有分类
linksData.links.forEach((e, i) => {
    let j = 4;
    if (i < j) ls = ls.concat(e.link_list);
});

// 生成格式化的 JSON 并输出
fs.writeFileSync('./source/flink_count.json', JSON.stringify({
    link_list: ls,
    length: ls.length
}, null, 2));

// 控制台提示
console.log(`✅ flink_count.json 生成成功，共读取 ${ls.length} 个友链`);
```

#### 2.2 脚本说明
- `linksData` 后的路径：需改成你自己 `links.yml` 的实际路径，不要直接复制；
- `j` 参数：控制读取友链分类数量，`j=4` 读前4个分类，读全部则改 `j=linksData.links.length`；

```
  - class_name: 给予帮助の佬们😘#分类1
    descr: 大佬选手😎 随便扒一个，够我抄着学仨月都不重样
    type: card
    suffix:
    link_list:
  - class_name: 伸手相助，自带温柔滤镜✨#分类2
    descr: 技术上是靠谱前辈，相处起来像合拍朋友，双向奔赴才香～
    type: card
    suffix:
    link_list:
  #这样以此类推，j数字大于实际分类不会报错，例如我只有2个分类，但是我填写4 会获取全部友链不会报错
```

- 输出路径：`source/flink_count.json` 无需修改，Hexo 会自动将 `source` 文件夹内文件同步到 `public` 目录，部署后可直接访问。

### 第三步：本地生成并验证 JSON 数据源（可选）
#### 3.1 安装依赖
打开 VS Code 终端（这个自己习惯用什么就用什么在博客根目录操作），执行以下命令安装脚本依赖：
```Bash
npm install yamljs --save
```

#### 3.2 手动生成 JSON 文件
终端执行以下命令，生成友链 JSON 文件：
```Bash
node links.js
```
成功后 `source` 目录会新增 `flink_count.json`，终端提示如下：
```Plain Text
✅ 友链 JSON 文件生成成功！路径：source/flink_count.json
📊 共读取 25 个友链
```

#### 3.3 本地预览验证（关键步骤）
终端执行命令（清缓存 → 生成 JSON → 构建博客 → 本地预览）：
```Bash
hexo cl && node link.js && hexo g && hexo s
```
预览服务启动后，浏览器访问 `http://localhost:4000/flink_count.json`，能看到如下 JSON 内容即验证成功：
```JSON
{
  "link_list": [
    {
      "name": "清羽飞扬",
      "link": "https://blog.liushen.fun/",
      "avatar": "https://blog.liushen.fun/info/avatar.ico",
      "descr": "柳影曳曳，清酒孤灯，扬笔撒墨，心境如霜",
      "topimg": "https://blog.liushen.fun/info/siteshot.jpg",
      "linkpage": "https://blog.liushen.fun/link/"
    },
    {
      "name": "张洪Heo",
      "link": "https://blog.zhheo.com/",
      "avatar": "https://img.zhheo.com/i/67d8fa75943e4.webp",
      "descr": "分享设计与科技生活",
      "topimg": "https://img.zhheo.com/i/67d8fb3c51399.webp",
      "linkpage": "https://blog.zhheo.com/link/"
    }
```
### 第四步：部署 JSON 文件（本地/自动化）
#### 4.1 本地手动部署
终端执行命令（生成 JSON → 构建静态文件 → 部署博客）：
```bash
node link.js && hexo g && hexo d
```
部署完成后，访问 `https://你的博客域名/flink_count.json`，能看到和本地预览一致的内容即成功。
⚠️ 注意：后续更新友链后，需先执行 `node link.js` 刷新 JSON 文件！

#### 4.2 GitHub Actions 自动化部署
若博客通过 GitHub Actions 自动部署，需修改 `.github/workflows/deploy.yml`，在 `hexo g` 前添加以下代码：
```yaml
      # ======================== 新增步骤：执行links.js生成友链JSON ========================
      # 1. 安装yamljs依赖（links.js需要这个包解析yml文件）
      - name: Install yamljs for links.js
        run: npm install yamljs --save
      # 2. 执行links.js脚本，生成flink_count.json到source目录
      - name: Run links.js to generate flink_count.json
        run: node links.js
```
添加后部署完成，访问域名下的 JSON 文件即可验证。

例如我的地址就是 https://hexo.814925.xyz/flink_count.json 即可看到和本地预览一致的 JSON 内容

![1764898490798.png](https://i.p-i.vip/133/20251205-693236be291d4.png)

### 第五步：部署 check-flink 检测项目
我们使用清羽飞扬大佬的 `check-flink` 项目：[check-flink](https://github.com/willow-god/check-flink)，步骤如下：

#### 5.1 复刻仓库
点击仓库右上角 `Fork` 按钮，将仓库复刻到你的 GitHub 账户（名称可自定义，如 `check-flink`）。

#### 5.2 配置仓库权限
确保 GitHub Actions 有权限修改文件：
1. 打开复刻后的仓库 → 点击 `Settings`；
2. 左侧栏选 `Actions` → `General`；
3. `Workflow permissions` 选择 `Read and write permissions` → 点击 `Save`。

#### 5.3 设置环境变量（关键）

该项目支持两种方式抓取友链数据，我选择的变量方式后期比较好维护。

仓库 `Settings` → `Secrets and variables` → `Actions` → `New repository secret`，添加以下变量：
- `SOURCE_URL`：你的 JSON 文件链接（如 `https://hexo.814925.xyz/flink_count.json`）；

- `AUTHOR_URL`：你的博客域名（如 `hexo.814925.xyz`，需先配置友链的 `linkpage` 才能检测反链）；

- `LIJIANGAPI_TOKEN`：开梨酱API密钥（[开梨酱API](https://api.nsmao.net/) 注册后生成，提升检测准确率）；

- 小小API：默认内置，无需配置。

- 如果不明白不管直接加三个变量就完事，后面不对在修改

  ![1764838766835.png](https://i.p-i.vip/133/20251204-69314d71274e2.png)

#### 5.4 修复反链检测不生效问题

按照作者提供的部署步骤操作后，我发现友链检测功能存在异常 —— 即便已正确填写 `AUTHOR_URL` 变量，该功能仍未生效。比如我测试用大佬友链，理论上这些链接中并不存在指向我博客（hexo.814925.xyz）的反链，但检测结果却显示全部存在反链，推测是 `AUTHOR_URL` 配置未被功能正常读取导致。

![1764828255282.png](https://i.p-i.vip/133/20251204-6931246351549.png)

排查过程中我发现，生成的 JSON 文件里显示的依旧是原作者的博客地址（blog.liushen.fun）；经过逐一核查定位，最终找到问题根源 —— 友链检测的自动化流程中并未引入 `AUTHOR_URL` 这个自定义变量，导致该配置项始终无法生效。

![1764828279703.png](https://i.p-i.vip/133/20251204-6931247ac3126.png)

修改仓库 `.github/workflows/main.yml`，在环境变量中添加 `AUTHOR_URL`：
原代码：

```yaml
- name: Run Python script to check frined-links
  env:
    PROXY_URL: ${{ secrets.PROXY_URL }}
    SOURCE_URL: ${{ secrets.SOURCE_URL }}  # 这里就是SOURCE_URL的引入
```
修改后：
```yaml
  env:
    PROXY_URL: ${{ secrets.PROXY_URL }}
    SOURCE_URL: ${{ secrets.SOURCE_URL }}
    AUTHOR_URL: ${{ secrets.AUTHOR_URL }}  # 新增这行！
```
可选：添加日志验证变量是否生效（在 `run` 区块加一行）：
```yaml
  run: |
    echo "SOURCE_URL: $SOURCE_URL"
    echo "AUTHOR_URL: $AUTHOR_URL"  # 可选，验证变量是否传递成功
    python main.py
```

修改后效果如下：

![1764834040372.png](https://i.p-i.vip/133/20251204-69313afada5b5.png)

除此之外，也可以直接修改 `main.py` 源码来解决该问题：直接舍弃 `AUTHOR_URL` 变量配置的方式即可，因为这段代码本身设计了兜底逻辑 —— 当未检测到外部配置的变量时，会默认使用代码内预设的参数，因此直接修改源码里的默认参数，就能替代变量配置的作用。

![1764828772403.png](https://i.p-i.vip/133/20251204-6931266825a76.png)

#### 5.5解决页面加载慢问题

1.    你在部署完成后，可能会遇到和我相同的问题：页面单独访问时加载速度极慢（耗时约十几秒），但将其 JS 引入博客使用时却完全不受影响。
2. 经过排查定位，问题出在字体文件链接上 ——`https://chinese-fonts-cdn.deno.dev/packages/jhlst/dist/京華老宋体v1_007/result.css` 这个的资源链接，大概率是被屏蔽或受网络环境限制导致无法访问。
3. 解决方式很简单，只需删除这个失效链接，替换为国内 CDN 的思源宋体资源：`https://cdn.bootcdn.net/ajax/libs/noto-serif-sc/1.001/noto-serif-sc.css`，替换后页面加载速度会立刻大幅提升；如果后续需要频繁访问该页面，建议完成此修改。也可以直接 Fork 我修改的仓库：[check-flink](https://github.com/RunWang925/check-flink)。
4. 另外补充一点：如果仅将该功能引入博客使用（直接调用 `result.json` 文件即可，格式为「域名 + result.json」，例如我的地址是 https://check-flink.814925.xyz/result.json），由于这种方式无需渲染字体，因此完全不需要修改上述字体链接。

![1764835429398.png](https://i.p-i.vip/133/20251204-6931406739238.png)

#### 5.6 手动触发检测

1. 打开仓库 `Actions` 页面；
2. 左侧选 `Check Links and Generate JSON`；
3. 点击 `Run workflow` → 再次点击 `Run workflow`。触发后等待流程完成;
⏰ 说明：项目默认每天北京时间9点、21点自动检测，也可手动触发。

### 第六步：部署检测结果页面
将检测结果部署为网页，推荐平台：腾讯 EdgeOne Pages、CloudFlare Pages、Vercel、Zeabur，步骤通用：EdgeOne Pages需要域名备案可能麻烦一点点
1. 在平台创建项目，导入复刻的 `check-flink` 仓库；

2. 部署分支选择 `page`（必须选对！）；

   ![1764834198416.png](https://i.p-i.vip/133/20251204-69313b998761b.png)

3. 可自定义域名（如我的 `check-flink.814925.xyz`）。最终[效果如下](https://check-flink.814925.xyz/)

  ![1764899138810.png](https://i.p-i.vip/133/20251205-69323945b3995.png)

  

若仅需通过该项目检查友链的连通状态及反链是否存在，至此就结束了。



## 二：将检测结果应用到 Hexo 博客友链页面进阶操作
部署完检测项目后，可将 `result.json` 中的检测结果（如延迟、反链状态）显示在博客友链页面，效果为：友链卡片左上角显示延迟时间（毫秒），鼠标悬浮隐藏。

### 第一步：新建 flink-status.js 文件
在博客 `source/js/` 目录（无则新建）新建 `flink-status.js`，复制以下代码（仅需修改一处）：

📝 修改说明：将 `fetch('https://check-flink.814925.xyz/result.json')` 中的地址替换为你部署的 `result.json` 地址。

```
function showRealLatency() {
    // 1. 读取本地缓存的数据和缓存时间
    const cachedData = localStorage.getItem('linkLatencyData');
    const cachedTime = localStorage.getItem('linkLatencyCacheTime');
    const CACHE_DURATION = 1800000; // 缓存时长：30分钟（毫秒）= 30*60*1000
    const now = Date.now();

    // 2. 如果有有效缓存，直接使用缓存数据
    if (cachedData && cachedTime && (now - cachedTime < CACHE_DURATION)) {
        processLatencyData(JSON.parse(cachedData));
        return; // 跳过请求，直接用缓存
    }

    // 3. 无有效缓存，发起请求（把下面的地址改成你的result.json地址）
    fetch('https://check-flink.814925.xyz/result.json')
        .then(res => res.json())
        .then(data => {
            // 4. 缓存数据和缓存时间到本地
            localStorage.setItem('linkLatencyData', JSON.stringify(data));
            localStorage.setItem('linkLatencyCacheTime', now.toString());
            processLatencyData(data);
        })
        .catch(err => console.error('加载延迟数据失败：', err));
}

// 抽离处理延迟数据的逻辑（复用缓存/请求的结果）
function processLatencyData(data) {
    const linkStatus = data.link_status || [];
    const cards = document.querySelectorAll('.flink-list-item, .links-card, .site-card, .flink-card');

    cards.forEach(card => {
        const oldTag = card.querySelector('.link-latency');
        if (oldTag) oldTag.remove();

        const linkEl = card.href ? card : card.querySelector('a');
        if (!linkEl || !linkEl.href) return;
        const cardLink = linkEl.href.replace(/\/$/, '');

        const matchItem = linkStatus.find(item => item.link.replace(/\/$/, '') === cardLink);
        if (!matchItem) return;

        let latencyText = 'ERR';
        let bgColor = '#B90000';
        if (matchItem.latency !== -1 && !isNaN(matchItem.latency)) {
            const latencyMs = Math.round(matchItem.latency * 1000);
            latencyText = `${latencyMs} ms`;
            if (matchItem.latency <= 2) bgColor = '#005E00';
            else if (matchItem.latency <= 5) bgColor = '#FED101';
            else if (matchItem.latency <= 10) bgColor = '#F0B606';
        }

        // 恢复上一版信号图标尺寸（10px字号版）
        const signalIcon = document.createElement('div');
        signalIcon.style = `
            display: flex;
            gap: 1px;
            align-items: flex-end;
            height: 6px; 
            width: 12px; 
            margin-right: 3px; 
        `;
        const barHeights = [1.5, 3, 4.5, 6];
        barHeights.forEach(height => {
            const bar = document.createElement('div');
            bar.style = `width: 1.5px; height: ${height}px; background: #fff; border-radius: 1px;`;
            signalIcon.appendChild(bar);
        });

        // 核心新增：默认透明度（0.8），悬浮仍完全隐藏
        const latencyTag = document.createElement('div');
        latencyTag.className = 'link-latency';
        latencyTag.style = `
            position: absolute;
            top: 4px;
            left: 4px;
            z-index: 9999;
            padding: 2px 6px; 
            background: ${bgColor};
            color: #fff;
            font-size: 10px; 
            font-weight: bold;
            border-radius: 6px; 
            display: inline-flex;
            align-items: center;
            opacity: 0.8; /* 默认80%透明度，视觉更柔和 */
            transition: font-size 0.3s ease-out, opacity 0.3s ease-out; /* 动画包含透明度 */
        `;

        const latencyTextEl = document.createElement('span');
        latencyTextEl.textContent = latencyText;

        latencyTag.appendChild(signalIcon);
        latencyTag.appendChild(latencyTextEl);
        card.style.position = 'relative';
        card.appendChild(latencyTag);

        // 悬浮隐藏逻辑：透明度直接降到0，字体缩0
        card.addEventListener('mouseenter', () => {
            latencyTag.style.fontSize = '0px';
            latencyTag.style.opacity = 0;
        });
        card.addEventListener('mouseleave', () => {
            latencyTag.style.fontSize = '10px';
            latencyTag.style.opacity = 0.8; // 恢复80%透明度
        });
    });
}

setTimeout(showRealLatency, 1000);
```


### 第二步：修改 links.pug 文件
找到主题目录下 `themes/solitude/layout/includes/page/links.pug`，在文件末尾添加引入 JS 的代码（完整代码如下）：
```
- var $data = page.data
if page.banner
    .flink#banners
        include ../widgets/page/links/banner
.flink.article-container
    each data in site.data[$data].links
        h2= data.class_name + " (" + data.link_list.length + ")"
        .flink-desc= data.descr
        case data.type
            when 'card'
                include ../widgets/page/links/linksCard
            when 'item'
                include ../widgets/page/links/linksItem
            when 'discn'
                include ../widgets/page/links/linksDiscn
    != page.content  

// 引入延迟标签JS（这行是新增的）
script(src='/js/flink-status.js')
```

### 第三步：预览效果
终端执行 `hexo cl && hexo g && hexo s` 本地预览，友链卡片左上角会显示延迟时间，鼠标悬浮隐藏、移开显示，大致效果可以看[野猪佩奇弟弟の友链页面](https://hexo.814925.xyz/links/)，效果如下：

![1764836465067.png](https://i.p-i.vip/133/20251204-6931447536078.png)

### 附：我的友链页面完整代码（可选参考）
我也附上 links 页面的完整代码（对应路径：source/links/index.md）——，若你有需要，可直接复制修改使用。
````
---
title: 友情链接
date: 2025-07-13 21:16:15
banner: false
type: links
data: links
---

<div style="background:#f6ffed;border:1px solid #e1f3d8;border-radius:8px;padding:15px;margin-bottom:20px;">
  <div style="color:#00b42a;font-weight:bold;margin-bottom:8px;font-size:16px;">
    <span>✓</span> 友链说明
  </div>
  <p style="margin:0 0 8px 0;font-size:16px;color:#333;">
    卡片左上角信息为github action自动检测，可能存在不准确现象，仅供站长检测友链可达性限制条件参考
  </p>
  <p style="margin:0;font-size:16px;color:#333;">
    以上排名不分先后，每一部分网站顺序随CDN刷新随机排布。
  </p>
</div>

#网页截图模块
## 网页截图
建议优先自行获取截图并上传至你的个人图床～若未提供网页截图，我会通过 WordPress 自动 API 生成截图，并将其托管到本站的自建图床。

<div style="margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 6px; border: 1px solid #eee;">
  <label for="blogUrl" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">请输入博客域名：</label>
  <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
    <input 
      type="text" 
      id="blogUrl" 
      placeholder="例如：hexo.814925.xyz(直接填纯域名)" 
      style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;"
    >
    <button 
      onclick="jumpToApi()" 
      style="padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
    >
      获取截图
    </button>
  </div>
  <!-- 极简API说明：最小字体 + 一句话 -->
  <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.4;">
    使用的截图接口格式为：https://s0.wp.com/mshots/v1/[完整域名]/?w=400&h=300（参数w=400为宽度，h=300为高度，可根据需要调整）
  </p>
</div>

<!-- 补全跳转逻辑的JS函数（核心修复） -->
<script>
function jumpToApi() {
  // 1. 获取输入的域名
  let domain = document.getElementById('blogUrl').value.trim();
  // 空值判断：输入为空则不执行
  if (!domain) return;
  // 2. 自动补全https协议（用户无需手动输入）
  if (!domain.startsWith('http')) {
    domain = `https://${domain}`;
  }
  // 3. 确保域名末尾带斜杠（匹配API格式）
  domain = domain.replace(/\/$/, '') + '/';
  // 4. 拼接完整的API链接
  const apiUrl = `https://s0.wp.com/mshots/v1/${domain}?w=400&h=300`;
  // 5. 新标签页跳转（核心：实现点击跳转）
  window.open(apiUrl, '_blank');
}
</script>

## 友链添加
如果您想在您的网站上添加我的友链，可以使用以下信息:

{% subtabs 友链配置信息 %}

<!-- tab 配置代码 -->
```yaml
 - name: 野猪佩奇弟弟
   link: https://hexo.814925.xyz/
   avatar: https://hexo.814925.xyz/img/touxiangpq.png
   descr: 记录让幸福可以翻阅
   topimg: https://hexo.814925.xyz/img/siteshot.png
   linkpage: https://hexo.814925.xyz/links/
```
<!-- endtab-->
<!-- tab 基础信息 -->
```yaml
- 网站名称：野猪佩奇弟弟
- 网站地址：https://hexo.814925.xyz/
- 网站图标：https://hexo.814925.xyz/img/touxiangpq.png
- 网站描述：记录学习与分享资源
- 网站截图：hhttps://hexo.814925.xyz/img/siteshot.png
- 友链页： https://hexo.814925.xyz/links/
```
<!-- endtab-->
{% endsubtabs %}
````

