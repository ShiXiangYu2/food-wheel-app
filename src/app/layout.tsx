import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '今日吃啥转盘',
  description: '随机决定今天吃什么的转盘应用',
  keywords: ['美食', '转盘', '随机选择', '今天吃什么'],
  authors: [{ name: '美食转盘应用' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans bg-gray-50 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  🍽️ 今日吃啥转盘
                </h1>
              </div>
              <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
                让转盘帮你决定今天吃什么！添加你喜欢的菜谱，旋转转盘随机选择
              </p>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-gray-500 text-sm">
                © 2025 今日吃啥转盘应用 - 让选择变得更有趣
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 