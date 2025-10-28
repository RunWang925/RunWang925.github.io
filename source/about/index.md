---
title: 关于页
date: 2025-07-13 22:48:25
comment: false
type: about
---
<script>
function loadRewardList() {
  const apiUrl = "https://rewards.zoerun.qzz.io/api/rewards"; // 赞赏API
  const cacheKey = "rewardListCache";
  const cacheTimeKey = "rewardListCacheTime";
  const cacheTTL = 30 * 60 * 1000; // 30分钟
  const rewardListContainer = document.querySelector(".reward-list-all");
  const totalAmountContainer = document.querySelector(".reward-list-tips p");

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function createRewardItem({ name, money, date }) {
    const item = document.createElement("div");
    item.className = "reward-list-item";
    const nameDiv = document.createElement("div");
    nameDiv.className = "reward-list-item-name";
    nameDiv.textContent = name;
    const bottomGroup = document.createElement("div");
    bottomGroup.className = "reward-list-bottom-group";
    const moneyDiv = document.createElement("div");
    moneyDiv.className = "reward-list-item-money";
    moneyDiv.innerHTML = `¥ ${money}`;
    moneyDiv.style.backgroundColor = "undefined";
    const time = document.createElement("time");
    time.className = "datetime reward-list-item-time";
    time.setAttribute("datetime", new Date(date).toISOString());
    time.style.display = "inline";
    time.textContent = formatTime(date);
    bottomGroup.appendChild(moneyDiv);
    bottomGroup.appendChild(time);
    item.appendChild(nameDiv);
    item.appendChild(bottomGroup);
    return item;
  }

  function renderList(rewards) {
    const allItems = rewardListContainer.children;
    const lastButton = allItems[allItems.length - 1];
    rewardListContainer.innerHTML = "";
    let total = 0;
    rewards.forEach(entry => {
      total += Number(entry.money || 0);
      rewardListContainer.appendChild(createRewardItem(entry));
    });
    rewardListContainer.appendChild(lastButton);
    totalAmountContainer.textContent = `总金额：¥ ${total.toFixed(2)}，将全部用于博客的维护和更新。`;
  }

  function isCacheValid() {
    const timestamp = localStorage.getItem(cacheTimeKey);
    if (!timestamp) return false;
    return Date.now() - Number(timestamp) < cacheTTL;
  }

  if (isCacheValid()) {
    try {
      const cachedData = JSON.parse(localStorage.getItem(cacheKey));
      if (Array.isArray(cachedData)) {
        renderList(cachedData);
        return;
      }
    } catch (e) {
      console.warn("缓存解析失败，尝试重新请求 API");
    }
  }

  fetch(apiUrl)
    .then(res => res.json())
    .then(json => {
      const rewards = json.data || [];
      renderList(rewards);
      localStorage.setItem(cacheKey, JSON.stringify(rewards));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    })
    .catch(err => {
      console.error("读取赞赏数据失败：", err);
    });
}
loadRewardList();
</script>