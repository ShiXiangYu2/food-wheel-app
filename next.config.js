/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完全禁用SWC
  swcMinify: false,
  
  // 实验性设置
  experimental: {
    forceSwcTransforms: false,
  },
  
  // 环境变量
  env: {
    NEXT_DISABLE_SWC: '1',
  },
}

module.exports = nextConfig 