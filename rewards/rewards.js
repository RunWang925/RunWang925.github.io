// 全局变量：当前页码、当前排序方式、本地数据
let currentPage = 1;
let currentSort = 'date'; // 默认为按日期排序
const pageSize = 5; // 每页显示5条数据
let rewardData = []; // 存储本地数据

// 格式化日期显示（统一显示为 月-日 或 年-月-日）
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const currentYear = new Date().getFullYear();
  return year === currentYear ? `${month}-${day}` : `${year}-${month}-${day}`;
}

// 根据金额设置样式（>=100红色，>=20橙色）
function getMoneyColorClass(money) {
  if (money >= 100) return 'reward-money-red';
  if (money >= 20) return 'reward-money-orange';
  return '';
}

// 计算总页数
function getTotalPages() {
  return Math.ceil(rewardData.length / pageSize);
}

// 渲染打赏列表（基于当前页和排序方式，使用DocumentFragment优化DOM操作）
function renderRewardList() {
  const rewardList = document.getElementById('rewardList');
  if (!rewardList) return;

  // 1. 排序数据
  const sortedData = [...rewardData].sort((a, b) => {
    if (currentSort === 'date') {
      // 按日期排序（新的在前）
      return new Date(b.date) - new Date(a.date);
    } else {
      // 按金额排序（大的在前）
      return b.money - a.money;
    }
  });

  // 2. 分页处理（截取当前页数据）
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = sortedData.slice(startIndex, startIndex + pageSize);

  // 3. 使用文档片段批量处理DOM，减少重绘重排
  const fragment = document.createDocumentFragment();

  // 渲染表头
  const headerDiv = document.createElement('div');
  headerDiv.className = 'reward-header';
  headerDiv.innerHTML = `
    <span class="reward-name">昵称</span>
    <span class="reward-money">金额</span>
    <span class="reward-date">时间</span>
  `;
  fragment.appendChild(headerDiv);

  // 渲染列表项
  if (currentPageData.length > 0) {
    currentPageData.forEach((item, index) => {
      const moneyClass = getMoneyColorClass(item.money);
      const itemDiv = document.createElement('div');
      itemDiv.className = `reward-item ${index === currentPageData.length - 1 ? 'last-item' : ''}`;
      itemDiv.innerHTML = `
        <span class="reward-name">${item.name}</span>
        <span class="reward-money ${moneyClass}">${item.money}元</span>
        <span class="reward-date">${formatDate(item.date)}</span>
      `;
      fragment.appendChild(itemDiv);
    });
  } else {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'reward-item';
    emptyDiv.textContent = '暂无赞赏数据';
    fragment.appendChild(emptyDiv);
  }

  // 一次性更新DOM
  rewardList.innerHTML = '';
  rewardList.appendChild(fragment);
  updatePagination(); // 更新分页按钮状态
}

// 更新分页显示
function updatePagination() {
  const totalPages = getTotalPages();
  const currentPageEl = document.getElementById('currentPage');
  if (currentPageEl) {
    currentPageEl.textContent = `第${currentPage}页 / 共${totalPages}页`;
  }

  // 禁用/启用分页按钮
  document.getElementById('firstPage').disabled = currentPage === 1;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;
  document.getElementById('lastPage').disabled = currentPage >= totalPages;
}

// 初始化事件（排序和分页按钮）
function initEvents() {
  // 排序下拉框
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1; // 排序改变时重置到第一页
    renderRewardList();
  });

  // 分页按钮（使用事件委托优化，减少监听数量）
  const pagination = document.querySelector('.pagination');
  pagination.addEventListener('click', (e) => {
    const totalPages = getTotalPages();
    switch(e.target.id) {
      case 'firstPage':
        if (currentPage !== 1) {
          currentPage = 1;
          renderRewardList();
        }
        break;
      case 'prevPage':
        if (currentPage > 1) {
          currentPage--;
          renderRewardList();
        }
        break;
      case 'nextPage':
        if (currentPage < totalPages) {
          currentPage++;
          renderRewardList();
        }
        break;
      case 'lastPage':
        if (currentPage !== totalPages) {
          currentPage = totalPages;
          renderRewardList();
        }
        break;
    }
  });
}

// 读取本地JSON数据（添加localStorage缓存，减少重复请求）
function loadLocalData() {
  const rewardList = document.getElementById('rewardList');
  if (rewardList) {
    rewardList.innerHTML = '<div class="reward-item loading">加载中...</div>'; // 显示加载状态
  }

  const cacheKey = 'rewardDataCache';
  const cacheExpiry = 3600000; // 缓存1小时

  // 尝试读取缓存
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < cacheExpiry) {
      rewardData = data;
      renderRewardList();
      return;
    }
  }

  // 缓存失效或无缓存时请求
  fetch('./rewards-data.json')
    .then(response => {
      if (!response.ok) throw new Error('数据文件未找到');
      return response.json();
    })
    .then(data => {
      rewardData = data;
      // 存入缓存
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      renderRewardList();
    })
    .catch(error => {
      console.error('加载数据失败:', error);
      if (rewardList) {
        rewardList.innerHTML = '<div class="reward-item">数据加载失败，请稍后重试</div>';
      }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initEvents(); // 绑定事件
  loadLocalData(); // 加载本地数据
});