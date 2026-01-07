import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // 추가
import './index.css'
import App from './App.jsx'

// 1. 서버 데이터 관리를 위한 클라이언트 객체 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // API 실패 시 자동 재시도 횟수 (선택사항)
      // retry: 1,
      // 브라우저 창을 다시 클릭했을 때 데이터를 새로고침할지 여부
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Provider로 App을 감싸서 하위 컴포넌트들이 Query를 쓰게 함 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)