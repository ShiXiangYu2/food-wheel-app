/**
 * 简单的数据库连接测试
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function simpleTest() {
  console.log('🔄 简单数据库连接测试...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📍 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : '未设置');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 环境变量未配置');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 尝试执行一个基本的查询来测试连接
    console.log('\n🔍 测试基本连接...');
    const { data, error } = await supabase.rpc('pg_backend_pid');
    
    if (error) {
      console.error('❌ 连接失败:', error);
      return;
    }

    console.log('✅ 基本连接成功，后端进程ID:', data);

    // 检查表是否存在
    console.log('\n🔍 检查表结构...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('无法使用RPC检查表，尝试直接查询...');
      
      // 直接尝试查询表
      const testTables = ['users', 'popular_recipes', 'user_custom_recipes', 'user_wheel_items'];
      for (const table of testTables) {
        try {
          const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
          if (error) {
            console.log(`❌ 表 ${table}:`, error.message);
          } else {
            console.log(`✅ 表 ${table}: 存在`);
          }
        } catch (err) {
          console.log(`❌ 表 ${table}: ${err.message}`);
        }
      }
    } else {
      console.log('数据库表:', tables);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

simpleTest(); 