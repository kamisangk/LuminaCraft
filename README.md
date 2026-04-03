# LuminaCraft

LuminaCraft 是一款基于 Next.js 的开源个人主页系统。项目采用便当盒 (Bento Box) 网格布局与原子化小组件架构，支持自由拖拽配置，为用户提供高可定制化的主页搭建方案。

## 技术栈

* 框架: Next.js (React)
* 运行环境: Node.js 18+

## 快速开始

### 安装与运行

1. 克隆项目
   ```bash
   git clone [https://github.com/kamisangk/LuminaCraft.git](https://github.com/kamisangk/LuminaCraft.git)
   cd LuminaCraft
   ```

2. 安装依赖
   ```bash
   npm install
   ```
   
3. 配置环境变量
   复制项目根目录的 `.env.example` 文件并重命名为 `.env.local`，配置管理员鉴权密码：
   ```env
   ADMIN_PASSWORD=your_secure_password
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```
   在浏览器中访问 `http://localhost:3000` 即可预览项目。

## 模块配置说明

管理员登录后台后，可通过面板直接进行页面管理：
* 背景管理：切换预设背景，或配置自定义 HTML 渲染。
* 组件定制：添加与编辑内置 iframe 模块，实现多媒体及外部信息的隔离渲染。

## 开源协议

本项目基于 [AGPL-3.0 License](LICENSE) 协议开源。