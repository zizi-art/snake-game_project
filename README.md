# 🐍 贪吃大蛇

纯 HTML + CSS + JavaScript 实现的贪吃蛇游戏，无任何外部依赖，双击 `index.html` 即可运行。

## 游戏操作

| 操作 | 说明 |
|------|------|
| 方向键 / WASD | 控制蛇移动 |
| 空格键 | 开始 / 重新开始 |
| 点击画布 / 滑动屏幕 | 移动端开始或控制方向 |

## 游戏规则

- 吃到红色食物得 1 分，蛇身变长
- 撞墙或撞到自身则游戏结束
- 最高分自动保存在浏览器本地存储中

## 本地运行

### 方式一：直接双击（推荐）

直接双击 `index.html`，用任意浏览器打开即可。

### 方式二：本地服务器（避免某些浏览器的安全限制）

```bash
# Python 3
python3 -m http.server 8080

# 然后访问
open http://localhost:8080
```

## 部署到 Vercel

### 方式一：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI（需要 Node.js）
npm i -g vercel

# 2. 在项目目录下执行
cd snake-game
vercel

# 按提示登录并完成部署，Vercel 会给你一个公开访问链接
```

### 方式二：通过 GitHub 自动部署

1. 将项目推送到 GitHub 仓库
2. 打开 [vercel.com](https://vercel.com)，登录后点击 **Add New Project**
3. 选择你的 GitHub 仓库，Framework Preset 选 **Other**
4. 点击 **Deploy**，完成后获得公开链接

> 静态项目无需任何额外配置，Vercel 会自动识别并部署。

## 文件结构

```
snake-game/
├── index.html   # 页面结构
├── style.css    # 样式
├── script.js    # 游戏逻辑
└── README.md    # 说明文档
```
