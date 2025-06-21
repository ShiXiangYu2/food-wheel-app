# 今日吃啥转盘应用

一个帮助用户随机决定吃什么的转盘网页应用。用户可以添加自定义菜谱或从推荐菜谱中选择，通过旋转转盘随机选出结果。

## ✨ 功能特性

- 🎯 **智能转盘**: 动态生成转盘，支持最多12个菜谱
- 🍽️ **菜谱管理**: 添加自定义菜谱或选择流行菜谱
- 📱 **响应式设计**: 完美适配移动端、平板和桌面
- 🔒 **免登录设计**: 基于UUID的用户识别，无需注册
- 🎨 **精美动画**: 流畅的转盘旋转动画和结果展示
- 🌈 **彩色分段**: 每个菜谱使用不同颜色区分

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript
- **样式处理**: Tailwind CSS
- **数据存储**: Supabase
- **用户识别**: UUID + LocalStorage

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd food-wheel-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置数据库

按照 [Supabase设置指南](./SUPABASE_SETUP.md) 完成数据库配置：

1. 创建Supabase项目
2. 执行数据库初始化脚本
3. 配置环境变量

### 4. 验证配置

```bash
# 测试数据库连接
npm run test:db
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
food-wheel-app/
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 主页面
│   ├── components/          # React组件
│   │   ├── WheelComponent.tsx      # 转盘组件
│   │   ├── RecipeManager.tsx       # 菜谱管理组件
│   │   └── SpinResultModal.tsx     # 结果弹窗组件
│   ├── lib/                 # 工具库
│   │   ├── supabase.ts      # Supabase客户端
│   │   ├── userUtils.ts     # 用户管理工具
│   │   └── recipeService.ts # 菜谱数据服务
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts         # 主要类型定义
│   └── styles/              # 样式文件
│       └── globals.css      # 全局样式
├── database/                # 数据库文件
│   ├── init.sql            # 数据库初始化脚本
│   └── popular_recipes_data.sql  # 流行菜谱数据
├── scripts/                 # 工具脚本
│   └── test-database.js     # 数据库测试脚本
├── SUPABASE_SETUP.md       # Supabase设置指南
└── package.json            # 项目配置
```

## 🗄️ 数据库设计

### 表结构

1. **users** - 用户表
   - `id` (UUID): 用户唯一标识
   - `created_at` (TIMESTAMP): 创建时间

2. **popular_recipes** - 流行菜谱表
   - `id` (SERIAL): 菜谱ID
   - `name` (VARCHAR): 菜谱名称
   - `created_at` (TIMESTAMP): 创建时间

3. **user_custom_recipes** - 用户自定义菜谱表
   - `id` (SERIAL): 自定义菜谱ID
   - `user_id` (UUID): 用户ID（外键）
   - `name` (VARCHAR): 菜谱名称
   - `created_at` (TIMESTAMP): 创建时间

4. **user_wheel_items** - 用户转盘项目表
   - `id` (SERIAL): 转盘项目ID
   - `user_id` (UUID): 用户ID（外键）
   - `recipe_name` (VARCHAR): 菜谱名称
   - `source_type` (VARCHAR): 来源类型（popular/custom）
   - `color` (VARCHAR): 转盘颜色
   - `created_at` (TIMESTAMP): 创建时间

## 🎮 使用说明

1. **添加菜谱**: 
   - 点击"流行菜谱"选择推荐菜谱
   - 点击"自定义添加"输入自己想吃的菜

2. **管理转盘**:
   - 在"当前转盘"标签查看已添加的菜谱
   - 点击"删除"按钮移除不想要的菜谱
   - 转盘最多支持12个菜谱

3. **转动转盘**:
   - 点击"🎲 开始转盘"按钮
   - 等待转盘停止
   - 查看随机选中的结果

## 🧪 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 测试数据库连接
npm run test:db

# 查看数据库设置指南
npm run setup:db
```

## 🔧 环境变量

创建 `.env.local` 文件：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 部署

本项目支持部署到以下平台：

- [Vercel](https://vercel.com)（推荐）
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)

部署时请确保配置好环境变量。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

如果遇到问题，请：

1. 查看 [Supabase设置指南](./SUPABASE_SETUP.md)
2. 运行 `npm run test:db` 检查数据库连接
3. 查看浏览器开发者工具的控制台
4. 检查 Supabase 项目仪表板的日志

---

**享受美食选择的乐趣！** 🎉 