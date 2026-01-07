---
abbrlink: 1c504892
title: 超详细！小白也能看懂的兰空图床付费版（Lsky-Pro+）部署教程
cover: 'https://imgteo.814925.xyz/file/waline/1765956234240_image.png'
categories:
  - 网站建设
  - 教程分享
tags:
  - Lsky-Pro+
  - 兰空图床

date: 2025-12-17 12:10:49
type:
comment:
ai_text:
recommend:
katex:
reprint:
locate:
--- 

# 超详细！小白也能看懂的兰空图床付费版（Lsky-Pro+）部署教程

## 先说在前面：关于 “本地开心版”

兰空图床（Lsky Pro+）官方正版需要付费 299 元，且 V2.3.0 版本开始加密了核心代码。本教程部署的是二叉树树大佬修改的**本地无需授权版**（基于 V2.2.3），特点如下：

- ✅ 输入任意授权密钥均可使用（无需联网验证）
- ✅ 不依赖官方服务器，所有操作在自己服务器完成
- ✅ 安装步骤和正版几乎一致，新手可轻松上手

⚠️ **重要声明**：此版本仅供学习交流使用，建议 24 小时内删除。支持正版请前往兰空图床官网购买授权～

本教程是我记录自己实际部署兰空图床的全过程 —— 为了把每一步细节都讲透彻，表述上可能会有些口语化、甚至带点 “口水话”，若显得啰嗦影响了阅读体验，还请大家多多理解呀～ 李姐万岁！

文章参考：https://acofork.com/posts/lskypro-local/

视频教程： https://www.bilibili.com/video/BV1UieUzQEvq/

## 一、安装包与工具准备

### 1. 安装包下载

- 主下载链接：[http://r2.072103.xyz/2xnzlskypro223.zpaq](http://r2.072103.xyz/2xnzlskypro223.zpaq)
- 解压密码：2xnz二叉树树 （使用 Bandizip，旧版本不支持 zpaq 格式）
- 备用链接：https://imgteo.814925.xyz/file/waline/1765866343987_2xnzlskypro223.zip（自己上传无解压密码）

下载后保存到电脑本地，后续会上传到服务器。

## 二、服务器环境配置

### 1. 服务器基础信息

- 服务器型号：Flexus 应用服务器 L 实例（香港节点）

- 配置：2核 | 2GiB 内存

- 操作系统：Ubuntu 24.04

### 2. 安装宝塔面板

- 操作：执行宝塔官方提供的单条安装命令（参考官方教程，步骤简单）

  **正式版：11.4.0**Ubuntu/Deepin一键安装命令

  ```
  wget -O install_panel.sh https://download.bt.cn/install/install_panel.sh && sudo bash install_panel.sh ssl251104
  ```

### 3.安装教程

#### 3.1 安装 PHP 版本

- 要求：PHP 版本 ≥ 8.2（教程使用 PHP 8.2.28）
- 操作：

    1. 宝塔面板 → 软件商店 → 搜索「PHP」
2. 找到「PHP 8.2」点击安装（其他版本如 8.3/8.4 可按需选择，但需满足 ≥8.2 要求）

#### 3.2 安装必要 PHP 扩展

操作：安装完 PHP 8.2.28 后，点击右侧「设置」→「安装扩展」

- 核心必装扩展（部分默认已安装，仅需补充缺失项）：

    1. SourceGuardian（宝塔面板中名称为 sg16）
    2. Fileinfo（通用扩展，内存＜1G 可能安装失败）
    3. Imagick（宝塔面板中名称为 imagemagick，需配合独立包安装）

![image.png](https://imgteo.814925.xyz/file/waline/1765945246614_image.png)

#### 3.3 解除 PHP 禁用函数

- 需删除的禁用函数（避免安装失败）如果这里不去解除函数，运行安装程序的时候会报错

    ![image.png](https://imgteo.814925.xyz/file/waline/1765950104464_image.png)

- 操作：

    1. 宝塔面板 →软件商店→  PHP 8.2.28 → 「设置」→「禁用函数」

    2. 搜索上述函数，点击「删除」解除禁用，保存设置
    
    3. proc_* 系列函数
    
    4. pcntl_* 系列函数这个函数有点多 我是全部搜索删除的（全部删除）
    
    5. exec、shell_exec、system
    
    6. symlink、readlink
    
       ![image.png](https://imgteo.814925.xyz/file/waline/1765950676788_image.png)
    
    

#### 3.4 安装 ImageMagick 独立包

注意：Imagick PHP 扩展 + ImageMagick 独立包 两者必须同时安装

- 操作步骤（通过 SSH 终端执行）：

  ```
  #检查系统是否安装 imageMagick
  dpkg -l | grep imagemagick
  #如果没有任何输出则表示没有安装。
  #安装
  sudo apt install imagemagick
  ```

    ![安装完成后提示](https://imgteo.814925.xyz/file/waline/1765945383945_image.png)

## 三、创建站点与上传源码

### 1. 创建站点

- 操作步骤：

    1. 宝塔面板 → 网站 → 「添加站点」

    2. 配置项：

        - 项目类型：传统项目

        - 域名：输入自己的域名（示例：lskypro.814925.xyz）

        - 根目录：默认生成（示例：/www/wwwroot/lskypro.814925.xyz）

        - FTP：不创建

        - 数据库：不创建

        - PHP 版本：选择「PHP-8.2」

    3. 点击「确定」完成创建
    
        ![image.png](https://imgteo.814925.xyz/file/waline/1765949336473_image.png)

### 2. 上传并解压源码

- 操作步骤：

    1. 进入站点根目录  点击根目录就可以跳转（示例：/www/wwwroot/lskypro.814925.xyz）

    2. 点击「上传」，选择安装包2xnzlskypro223.zip

    3. 双击压缩包解压

        ![image.png](https://imgteo.814925.xyz/file/waline/1765949576803_image.png)

        4.解压完成后删除无用文件：
        
        - 安装包原文件（2xnzlskypro223.zip ）
        - 404.html（默认生成的无用文件）
        
        ![image.png](https://imgteo.814925.xyz/file/waline/1765949617438_image.png)

### 3. 配置伪静态

- 操作步骤：

    1. 宝塔面板 → 对应站点 → 「设置」→「伪静态」

    2. 粘贴以下代码（官网提供），点击「保存」：
    
       ```
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }
       
       location ~ ^/livewire {
           expires off;
           try_files $uri $uri/ /index.php?$query_string;
       }
       
       location ~ .*\.(jpg|jpeg|webp|avif|bmp|gif|png|tif|tiff|jp2|j2k|jpf|jpm|jpg2|j2c|jpc|jpx|heic|heif)$ {
           try_files $uri $uri/ /index.php?$query_string;
       }
       ```
    
       ![image.png](https://imgteo.814925.xyz/file/waline/1765949782405_image.png)


### 4. 修改运行目录

- 操作：

    1. 宝塔面板 → 对应站点 → 「设置」→「网站目录」

    2. 运行目录：选择「/public」，点击「保存」
    
      ![image.png](https://imgteo.814925.xyz/file/waline/1765958252782_image.png)
    
       

## 四、执行安装脚本

### 1. 执行命令：（SSH 终端）

```
#进入站点目录
cd /www/wwwroot/lskypro.814925.xyz
#安装脚本文件instal1.sh，我们给该脚本赋予可执行权限
chmod +x install.sh
#然后执行安装脚本
./install.sh
```

 检测状态应该是全部勾选，如果提示缺少就说明前面为未安装成功，去检查对应的扩展

 ![image.png](https://imgteo.814925.xyz/file/waline/1765950933236_image.png)



### 2. 跟随脚本提示配置

- 配置项说明：

    1. 应用名称：默认「Lsky Pro+ 野猪佩奇弟弟」，可自定义

    2. 应用域名：填写已绑定的域名（示例：[https://lskypro.814925.xyz](https://lskypro.814925.xyz)，需准确填写，避免后期修改数据库）

    3. 授权密钥：输入任意授权密钥均可使用（无需联网验证）

    4. 数据库：推荐使用默认的SQLite 3.350+ 直接默认回车既可以不允许去创建

    5. 管理员账号：输入邮箱和密码（后续登录使用）

       ![image.png](https://imgteo.814925.xyz/file/waline/1765951880572_image.png)

    这样就是提示安装成功了 ，一路回车既可 若提示「无法设置文件所有者」，无需处理，后续功能不影响

    ![image.png](https://imgteo.814925.xyz/file/waline/1765952381284_image.png)



## 五、后续配置（必做）

### 1. 配置消息队列（解决图片上传、缩略图生成异常）

#### 1.1 安装进程守护工具

- 操作：宝塔面板 → 软件商店 → 搜索「进程守护」→ 安装

#### 1.2 添加守护进程

- 操作步骤：

    1. 进程守护 → 「添加守护进程」

    2. 配置项：

        - 名称：自定义（英文，示例：lskypro）

        - 启动用户：root

        - 运行目录：站点根目录（示例：/www/wwwroot/lskypro.814925.xyz）

        - 启动命令：php artisan queue:work

        - 进程数量：1（默认即可）

    3. 点击「确定」，启动进程
    
        ![image.png](https://imgteo.814925.xyz/file/waline/1765952572888_image.png)

### 2. 配置计划任务

- 操作步骤（SSH 终端）：

    1. 进入站点目录：

       ```
       cd /www/wwwroot/lskypro.814925.xyz
       ```

    2. 编辑定时任务：
    
       ```
       crontab -e
       ```

    3. 选择编辑器：输入「1」（nano，最简单）
    
    4. 粘贴以下代码：
    
       ```
       * * * * * cd /www/wwwroot/app.com && php artisan schedule:run >> /dev/null 2>&1
       ```
    
    5. 保存退出：按「Ctrl+X」→ 输入「Y」→ 回车确认
    
       注意：这里打开可能默认有其他代码你全部删除 然后粘贴上面的代码既可
    
       ![image.png](https://imgteo.814925.xyz/file/waline/1765952932820_image.png)

## 六、收尾配置

### 1. 域名解析

- 操作：登录域名服务商后台，将域名 A 记录指向服务器 IP 地址

### 2. SSL 证书配置

- 操作：宝塔面板 → 对应站点 → 「SSL」→ 申请免费证书（Let's Encrypt）→ 自动部署

### 3. 访问测试

- 打开浏览器，输入配置的域名（示例：[https://lskypro.814925.xyz](https://lskypro.814925.xyz)）

- 使用安装时设置的管理员账号登录，即可使用图床功能

## 八、总结

1.使用 Lsky-Pro+ 2.2.3 时，不太习惯它的上传页面设计 —— 上传入口藏在右侧列表里，操作起来总觉得不够顺手。

2.付费版用户可以加入 QQ 群获取主题（换主题或许能解决这个页面体验问题）

3.想要[白雾林's Picbed](https://www.baiwulin.work/upload)那种上传页的效果，目前还没找到对应的配置教程，等之后查到了会回来补充这部分内容。

4.另外提个实用建议：如果已经部署了付费版，但其实用不上它的很多功能，不如直接换开源版部署 —— 不仅步骤比本教程更简单、还更轻量，对服务器的配置要求也更低，用起来会更省心。

## ⚠️ 须知
说明：本文图片存储依赖 CloudFlare-ImgBed 图床服务，结合多吉云 CDN 加速。