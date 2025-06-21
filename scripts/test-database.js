/**
 * 数据库连接测试脚本
 * 用于验证Supabase数据库是否正确配置
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔄 开始测试数据库连接...\n');

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 环境变量未配置');
    console.log('请确保 .env.local 文件包含以下变量：');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('✅ 环境变量已配置');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 匿名密钥: ${supabaseAnonKey.substring(0, 20)}...`);

  // 创建Supabase客户端
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 测试1: 检查数据库连接
    console.log('\n🔍 测试1: 检查数据库连接...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('✅ 数据库连接成功');

    // 测试2: 检查所有必需的表是否存在
    console.log('\n🔍 测试2: 检查数据表结构...');
    const tables = ['users', 'popular_recipes', 'user_custom_recipes', 'user_wheel_items'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (tableError) {
          console.error(`❌ 表 ${table} 不存在或无法访问:`, tableError.message);
          return false;
        }
        console.log(`✅ 表 ${table} 存在`);
      } catch (err) {
        console.error(`❌ 检查表 ${table} 时出错:`, err.message);
        return false;
      }
    }

    // 测试3: 检查流行菜谱数据
    console.log('\n🔍 测试3: 检查流行菜谱数据...');
    const { data: recipes, error: recipesError } = await supabase
      .from('popular_recipes')
      .select('*')
      .limit(5);

    if (recipesError) {
      console.error('❌ 无法获取流行菜谱数据:', recipesError.message);
      return false;
    }

    if (!recipes || recipes.length === 0) {
      console.warn('⚠️  流行菜谱表为空，请运行初始化数据脚本');
      console.log('请在Supabase SQL编辑器中执行 database/popular_recipes_data.sql');
      return false;
    }

    console.log(`✅ 流行菜谱数据正常，共 ${recipes.length} 条示例数据`);
    console.log('示例菜谱:', recipes.map(r => r.name).join(', '));

    // 测试4: 测试用户创建功能
    console.log('\n🔍 测试4: 测试用户创建功能...');
    const { v4: uuidv4 } = require('uuid');
    const testUserId = uuidv4();
    
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id: testUserId }]);

    if (insertError) {
      console.error('❌ 无法创建测试用户:', insertError.message);
      return false;
    }

    console.log('✅ 用户创建功能正常');

    // 清理测试数据
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✅ 测试数据已清理');

    console.log('\n🎉 所有测试通过！数据库配置正确。');
    return true;

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    return false;
  }
}

// 运行测试
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✨ 数据库已准备就绪，可以启动应用！');
      console.log('运行 npm run dev 启动开发服务器');
      process.exit(0);
    } else {
      console.log('\n❌ 数据库配置不完整，请查看上述错误信息');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ 测试脚本执行失败:', error);
    process.exit(1);
  }); 