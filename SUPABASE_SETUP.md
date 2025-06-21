# Supabase数据库设置指南

## 第一步：创建Supabase项目

1. 访问 [Supabase官网](https://supabase.com) 并登录您的账户
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **项目名称**: 今日吃啥转盘应用
   - **数据库密码**: 请设置一个安全的密码并记住
   - **区域**: 选择离您最近的区域（建议选择Singapore）
   
4. 点击 "Create new project" 等待项目创建完成（通常需要1-2分钟）

## 第二步：获取项目配置信息

1. 项目创建完成后，进入项目仪表板
2. 点击左侧导航栏中的 "Settings" > "API"
3. 复制以下信息：
   - **Project URL**: 在 "Project URL" 部分
   - **anon public**: 在 "Project API keys" 部分的 "anon public" 密钥

## 第三步：配置环境变量

1. 在项目根目录创建 `.env.local` 文件：

```bash
# 在项目根目录执行
echo "NEXT_PUBLIC_SUPABASE_URL=你的项目URL" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥" >> .env.local
```

2. 或者手动创建 `.env.local` 文件，内容如下：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的匿名密钥
```

## 第四步：初始化数据库

### 方法一：使用SQL编辑器（推荐）

1. 在Supabase仪表板中，点击左侧导航栏的 "SQL Editor"
2. 点击 "New query" 创建新查询
3. 复制 `database/init.sql` 文件的内容到查询编辑器
4. 点击 "Run" 执行查询，创建数据表
5. 再次点击 "New query"，复制 `database/popular_recipes_data.sql` 文件的内容
6. 点击 "Run" 执行查询，插入流行菜谱数据

### 方法二：使用MCP工具（需要访问令牌）

如果您有Supabase访问令牌，可以使用以下命令：

```bash
# 设置环境变量
export SUPABASE_ACCESS_TOKEN=your_access_token

# 应用数据库迁移
supabase db reset --linked
```

## 第五步：设置RLS（行级安全）

1. 在Supabase仪表板中，点击 "Authentication" > "Policies"
2. 由于我们使用免登录设计，暂时可以禁用RLS或设置宽松的策略
3. 对于生产环境，建议根据用户ID设置适当的RLS策略

## 第六步：验证设置

1. 确保 `.env.local` 文件已正确配置
2. 运行项目：`npm run dev`
3. 访问 `http://localhost:3000` 检查是否能正常加载
4. 尝试添加菜谱到转盘，验证数据库连接

## 故障排除

### 常见问题

1. **"Unauthorized" 错误**
   - 检查 `.env.local` 文件中的URL和密钥是否正确
   - 确保环境变量没有多余的空格或引号

2. **数据库连接失败**
   - 检查Supabase项目是否处于活动状态
   - 确认数据库密码是否正确

3. **表不存在错误**
   - 确认已执行 `database/init.sql` 脚本
   - 检查SQL执行是否有错误

4. **无法插入数据**
   - 检查RLS策略设置
   - 确认数据格式是否符合表结构

### 获取帮助

如果遇到问题，请检查：
1. Supabase项目仪表板的日志
2. 浏览器开发者工具的网络和控制台
3. Next.js应用的终端输出

## 项目ID记录

请在完成设置后，将您的项目ID记录在这里：

```
项目ID: [请填写您的Supabase项目ID]
项目URL: [请填写您的项目URL]
创建时间: [请填写创建时间]
```

---

**注意**: 请确保不要将包含敏感信息的 `.env.local` 文件提交到Git仓库中。 