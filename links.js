// 引入依赖（需先安装 yamljs）
const fs = require('fs');
const yaml = require('yamljs');

// 读取友链配置文件（修改为你的 links.yml 路径）
const linksData = yaml.load('./source/_data/links.yml');
let ls = [];

// 遍历分类，读取前4个分类的友链（j可自定义）
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