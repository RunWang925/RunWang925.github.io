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

    // 3. 无有效缓存，发起请求
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