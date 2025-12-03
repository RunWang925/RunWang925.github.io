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
```yaml
- name: 野猪佩奇弟弟
  link: https://hexo.814925.xyz/
  avatar: https://hexo.814925.xyz/img/touxiangpq.png
  descr: 记录让幸福可以翻阅
  topimg: https://hexo.814925.xyz/img/siteshot.jpg
  ```
