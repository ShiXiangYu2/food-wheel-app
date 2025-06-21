-- 今日吃啥转盘应用 - 数据库初始化脚本
-- 创建时间: 2025-01-21
-- 版本: 1.0

-- 启用必要的扩展
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- 如果需要加密功能

-- 1. 用户表 (users)
-- 存储系统中所有用户的基本信息
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,                                                       -- 用户唯一标识(UUID)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL -- 创建时间
);

-- 添加表注释
COMMENT ON TABLE users IS '用户表，存储系统中所有用户的基本信息';
COMMENT ON COLUMN users.id IS '用户唯一标识，由客户端生成的UUID';
COMMENT ON COLUMN users.created_at IS '用户创建时间，UTC时区';

-- 2. 流行菜谱表 (popular_recipes)
-- 系统预置的流行菜谱列表，所有用户共享
CREATE TABLE IF NOT EXISTS popular_recipes (
    id SERIAL PRIMARY KEY,                                                     -- 自增主键
    name VARCHAR(50) NOT NULL UNIQUE,                                         -- 菜谱名称，唯一
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL -- 创建时间
);

-- 添加表注释
COMMENT ON TABLE popular_recipes IS '流行菜谱表，系统预置的菜谱列表，所有用户共享';
COMMENT ON COLUMN popular_recipes.id IS '菜谱ID，自增主键';
COMMENT ON COLUMN popular_recipes.name IS '菜谱名称，最大50字符，全局唯一';
COMMENT ON COLUMN popular_recipes.created_at IS '菜谱创建时间，UTC时区';

-- 3. 用户自定义菜谱表 (user_custom_recipes)
-- 用户自己创建的菜谱
CREATE TABLE IF NOT EXISTS user_custom_recipes (
    id SERIAL PRIMARY KEY,                                                     -- 自增主键
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,             -- 用户ID，外键
    name VARCHAR(50) NOT NULL,                                                -- 菜谱名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL, -- 创建时间
    UNIQUE(user_id, name)                                                     -- 同一用户内菜谱名称唯一
);

-- 添加表注释
COMMENT ON TABLE user_custom_recipes IS '用户自定义菜谱表，存储用户创建的个人菜谱';
COMMENT ON COLUMN user_custom_recipes.id IS '自定义菜谱ID，自增主键';
COMMENT ON COLUMN user_custom_recipes.user_id IS '菜谱所属用户ID，外键关联users表';
COMMENT ON COLUMN user_custom_recipes.name IS '菜谱名称，最大50字符，同一用户内唯一';
COMMENT ON COLUMN user_custom_recipes.created_at IS '菜谱创建时间，UTC时区';

-- 4. 用户转盘项目表 (user_wheel_items)
-- 用户添加到转盘中的菜谱项目
CREATE TABLE IF NOT EXISTS user_wheel_items (
    id SERIAL PRIMARY KEY,                                                     -- 自增主键
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,             -- 用户ID，外键
    recipe_name VARCHAR(50) NOT NULL,                                         -- 菜谱名称
    source_type VARCHAR(10) NOT NULL CHECK (source_type IN ('popular', 'custom')), -- 来源类型：流行菜谱或自定义菜谱
    color VARCHAR(7) NOT NULL,                                                -- 转盘中的颜色，十六进制格式(#RRGGBB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL, -- 创建时间
    UNIQUE(user_id, recipe_name)                                              -- 同一用户转盘中菜谱名称唯一
);

-- 添加表注释
COMMENT ON TABLE user_wheel_items IS '用户转盘项目表，存储用户添加到转盘中的菜谱';
COMMENT ON COLUMN user_wheel_items.id IS '转盘项目ID，自增主键';
COMMENT ON COLUMN user_wheel_items.user_id IS '项目所属用户ID，外键关联users表';
COMMENT ON COLUMN user_wheel_items.recipe_name IS '菜谱名称，最大50字符';
COMMENT ON COLUMN user_wheel_items.source_type IS '菜谱来源类型：popular(流行菜谱)或custom(自定义菜谱)';
COMMENT ON COLUMN user_wheel_items.color IS '转盘中的显示颜色，十六进制格式(#RRGGBB)';
COMMENT ON COLUMN user_wheel_items.created_at IS '项目添加时间，UTC时区';

-- 创建索引以优化查询性能
-- 用户自定义菜谱按用户ID查询的索引
CREATE INDEX IF NOT EXISTS idx_user_custom_recipes_user_id ON user_custom_recipes(user_id);

-- 用户转盘项目按用户ID查询的索引
CREATE INDEX IF NOT EXISTS idx_user_wheel_items_user_id ON user_wheel_items(user_id);

-- 流行菜谱按名称查询的索引（用于快速查找和去重）
CREATE INDEX IF NOT EXISTS idx_popular_recipes_name ON popular_recipes(name);

-- 用户表创建时间索引（如果需要按时间排序查询用户）
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 打印初始化完成信息
-- SELECT '数据库表结构初始化完成' AS status; 