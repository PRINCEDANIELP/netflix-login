import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (user, rememberMe = true) => {
    if (!user || !user.email) return;
    setIsLoggedIn(true);
    setUserData(user);
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('user');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setUserData(parsed);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <Dashboard user={userData} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
