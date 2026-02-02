import React, { useState, useEffect } from 'react';
import { User, AuthState } from './types';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import { authService } from './services/auth';
import MyPage from './components/MyPage/MyPage';
import { CustomAlert, AlertType } from './components/Common/CustomAlert';
import LandingPage from './components/Landing/LandingPage';

const App: React.FC = () => {
  const savedUser = localStorage.getItem('visionary_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  const [auth, setAuth] = useState<AuthState>({
    user: initialUser,
    token: localStorage.getItem('visionary_token'),
    isAuthenticated: !!localStorage.getItem('visionary_token'),
  });

  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard' | 'mypage'>(
    localStorage.getItem('visionary_token') ? 'dashboard' : 'landing'
  );

  const [alertInfo, setAlertInfo] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void; 
    cancelLabel?: string;   
    confirmLabel?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const handleAuthSuccess = (user: User, token: string) => {
    setAuth({ user, token, isAuthenticated: true });
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setAuth({ user: null, token: null, isAuthenticated: false });
    setView('landing');
  };

  const showAlert = (
    type: AlertType, 
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    cancelLabel?: string,
    confirmLabel?: string
  ) => {
    setAlertInfo({ isOpen: true, type, title, message, onConfirm, cancelLabel, confirmLabel });
  };

  const closeAlert = () => setAlertInfo(prev => ({ ...prev, isOpen: false }));

  return (
    <div className="min-h-screen">
      {view === 'landing' && (
        <LandingPage 
          onEnter={() => setView('login')} 
          onSignup={() => setView('signup')} 
        />
      )}

      {view === 'login' && (
        <Login 
          onSuccess={handleAuthSuccess} 
          onSwitchToSignup={() => setView('signup')} 
          onAlert={showAlert} // 알림 함수 전달
        />
      )}
      {view === 'signup' && (
        <Signup 
          onSuccess={handleAuthSuccess} 
          onSwitchToLogin={() => setView('login')} 
          onAlert={showAlert} // 알림 함수 전달
        />
      )}
      
      {view === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          user={auth.user} 
          onNavigateToMyPage={() => setView('mypage')} 
          onAlert={showAlert} // 알림 함수 전달
        />
      )}

      {view === 'mypage' && (
        <MyPage 
          user={auth.user} 
          onBack={() => setView('dashboard')} 
          onLogout={handleLogout} 
          onAlert={showAlert} // 알림 함수 전달
        />
      )}

      {/* 커스텀 알림 컴포넌트를 여기에 배치해야 화면에 나타납니다 */}
      <CustomAlert 
        {...alertInfo}
        onClose={closeAlert}
      />
    </div>
  );
};

export default App;