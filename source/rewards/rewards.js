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

// 渲染打赏列表（基于当前页和排序方式）
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

  // 3. 渲染HTML
  let html = `
    <div class="reward-header">
      <span class="reward-name">昵称</span>
      <span class="reward-money">金额</span>
      <span class="reward-date">时间</span>
    </div>
  `;

  if (currentPageData.length > 0) {
    currentPageData.forEach((item, index) => {
      const moneyClass = getMoneyColorClass(item.money);
      html += `
        <div class="reward-item ${index === currentPageData.length - 1 ? 'last-item' : ''}">
          <span class="reward-name">${item.name}</span>
          <span class="reward-money ${moneyClass}">${item.money}元</span>
          <span class="reward-date">${formatDate(item.date)}</span>
        </div>
      `;
    });
  } else {
    html += '<div class="reward-item">暂无赞赏数据</div>';
  }

  rewardList.innerHTML = html;
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

  // 分页按钮
  document.getElementById('firstPage').addEventListener('click', () => {
    if (currentPage !== 1) {
      currentPage = 1;
      renderRewardList();
    }
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderRewardList();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < getTotalPages()) {
      currentPage++;
      renderRewardList();
    }
  });

  document.getElementById('lastPage').addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (currentPage !== totalPages) {
      currentPage = totalPages;
      renderRewardList();
    }
  });
}

// 读取本地JSON数据
function loadLocalData() {
  // 读取同目录下的 rewards-data.json
  fetch('./rewards-data.json')
    .then(response => {
      if (!response.ok) throw new Error('数据文件未找到');
      return response.json();
    })
    .then(data => {
      rewardData = data; // 保存数据
      renderRewardList(); // 渲染列表
    })
    .catch(error => {
      console.error('加载数据失败:', error);
      document.getElementById('rewardList').innerHTML = '<div class="reward-item">数据加载失败，请检查文件是否存在</div>';
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initEvents(); // 绑定事件
  loadLocalData(); // 加载本地数据
});
