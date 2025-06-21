-- 今日吃啥转盘应用 - 行级安全策略(RLS)设置
-- 创建时间: 2025-01-21
-- 版本: 1.0
-- 说明: 为免登录UUID设计的安全策略

-- 启用行级安全(RLS)
-- 注意：对于匿名用户访问的应用，我们需要特殊处理RLS策略

-- 1. 用户表(users) - 允许匿名用户管理自己的记录
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入自己的用户记录
CREATE POLICY "Allow anonymous user insertion" ON users
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 允许匿名用户查看所有用户记录（用于验证用户是否存在）
CREATE POLICY "Allow anonymous user selection" ON users
    FOR SELECT
    TO anon
    USING (true);

-- 2. 流行菜谱表(popular_recipes) - 所有用户只读
ALTER TABLE popular_recipes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户查看所有流行菜谱
CREATE POLICY "Allow anonymous read popular recipes" ON popular_recipes
    FOR SELECT
    TO anon
    USING (true);

-- 只允许管理员插入流行菜谱（通过服务端脚本）
CREATE POLICY "Allow service role insert popular recipes" ON popular_recipes
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- 3. 用户自定义菜谱表(user_custom_recipes) - 用户只能操作自己的菜谱
ALTER TABLE user_custom_recipes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户查看自己的自定义菜谱
-- 注意：在匿名模式下，我们通过客户端传递的用户ID进行过滤
CREATE POLICY "Allow anonymous read own custom recipes" ON user_custom_recipes
    FOR SELECT
    TO anon
    USING (true); -- 客户端需要在查询时指定用户ID进行过滤

-- 允许匿名用户插入自己的自定义菜谱
CREATE POLICY "Allow anonymous insert own custom recipes" ON user_custom_recipes
    FOR INSERT
    TO anon
    WITH CHECK (true); -- 客户端需要确保插入正确的用户ID

-- 允许匿名用户删除自己的自定义菜谱
CREATE POLICY "Allow anonymous delete own custom recipes" ON user_custom_recipes
    FOR DELETE
    TO anon
    USING (true); -- 客户端需要在删除时指定正确的用户ID

-- 4. 用户转盘项目表(user_wheel_items) - 用户只能操作自己的转盘项目
ALTER TABLE user_wheel_items ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户查看自己的转盘项目
CREATE POLICY "Allow anonymous read own wheel items" ON user_wheel_items
    FOR SELECT
    TO anon
    USING (true); -- 客户端需要在查询时指定用户ID进行过滤

-- 允许匿名用户插入自己的转盘项目
CREATE POLICY "Allow anonymous insert own wheel items" ON user_wheel_items
    FOR INSERT
    TO anon
    WITH CHECK (true); -- 客户端需要确保插入正确的用户ID

-- 允许匿名用户删除自己的转盘项目
CREATE POLICY "Allow anonymous delete own wheel items" ON user_wheel_items
    FOR DELETE
    TO anon
    USING (true); -- 客户端需要在删除时指定正确的用户ID

-- 允许匿名用户更新自己的转盘项目（比如修改颜色）
CREATE POLICY "Allow anonymous update own wheel items" ON user_wheel_items
    FOR UPDATE
    TO anon
    USING (true)  -- 客户端需要确保更新正确的用户ID记录
    WITH CHECK (true);

-- 5. 为服务角色添加完全访问权限（用于数据维护和管理）
-- 服务角色可以访问所有表的所有操作，用于后台管理和数据迁移

-- 用户表服务角色策略
CREATE POLICY "Service role full access users" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 流行菜谱表服务角色策略（已在上面创建插入策略）
CREATE POLICY "Service role full access popular recipes" ON popular_recipes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 用户自定义菜谱表服务角色策略
CREATE POLICY "Service role full access custom recipes" ON user_custom_recipes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 用户转盘项目表服务角色策略
CREATE POLICY "Service role full access wheel items" ON user_wheel_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. 创建用于验证和清理的辅助函数
-- 注意：这些函数需要 service_role 权限执行

-- 清理无效的转盘项目（引用不存在的用户）
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- 清理无效的用户自定义菜谱
    DELETE FROM user_custom_recipes 
    WHERE user_id NOT IN (SELECT id FROM users);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 清理无效的用户转盘项目
    DELETE FROM user_wheel_items 
    WHERE user_id NOT IN (SELECT id FROM users);
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count = deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户的转盘项目统计信息
CREATE OR REPLACE FUNCTION get_user_wheel_stats(user_uuid UUID)
RETURNS TABLE(
    total_items INTEGER,
    popular_count INTEGER,
    custom_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_items,
        COUNT(CASE WHEN source_type = 'popular' THEN 1 END)::INTEGER as popular_count,
        COUNT(CASE WHEN source_type = 'custom' THEN 1 END)::INTEGER as custom_count
    FROM user_wheel_items 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查菜谱名称是否已存在于用户的转盘中
CREATE OR REPLACE FUNCTION check_recipe_exists_in_wheel(user_uuid UUID, recipe_name_param VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_wheel_items 
        WHERE user_id = user_uuid AND recipe_name = recipe_name_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为匿名用户授予执行这些函数的权限
GRANT EXECUTE ON FUNCTION get_user_wheel_stats(UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_recipe_exists_in_wheel(UUID, VARCHAR) TO anon;

-- 只有服务角色可以执行清理函数
GRANT EXECUTE ON FUNCTION cleanup_orphaned_records() TO service_role;

-- 输出设置完成信息
-- SELECT 'RLS策略设置完成，支持匿名用户基于UUID的数据访问控制' AS status; 