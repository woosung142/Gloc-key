
import React, { useState, useEffect } from 'react';
import { User, AuthState } from './types';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import { authService } from './services/auth';

const App: React.FC = () => {

  const savedUser = localStorage.getItem('visionary_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  const [auth, setAuth] = useState<AuthState>({
    user: initialUser,
    token: localStorage.getItem('visionary_token'),
    isAuthenticated: !!localStorage.getItem('visionary_token'),
  });
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>(
    localStorage.getItem('visionary_token') ? 'dashboard' : 'login'
  );

  const handleAuthSuccess = (user: User, token: string) => {
    setAuth({ user, token, isAuthenticated: true });
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setAuth({ user: null, token: null, isAuthenticated: false });
    setView('login');
  };

  return (
    <div className="min-h-screen">
      {view === 'login' && (
        <Login 
          onSuccess={handleAuthSuccess} 
          onSwitchToSignup={() => setView('signup')} 
        />
      )}
      {view === 'signup' && (
        <Signup 
          onSuccess={handleAuthSuccess} 
          onSwitchToLogin={() => setView('login')} 
        />
      )}
      {view === 'dashboard' && (
        <Dashboard onLogout={handleLogout} user={auth.user} />
      )}
    </div>
  );
};

export default App;
