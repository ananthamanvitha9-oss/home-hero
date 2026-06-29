import { useState } from 'react';
import { AuthContext } from './AuthContextCore';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [portalMode, setPortalMode] = useState(() => {
    return localStorage.getItem('portalMode') || 'customer';
  });
  const [simpleView, setSimpleView] = useState(() => {
    return localStorage.getItem('simpleView') === 'true';
  });

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const updateUserData = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updatePortalMode = (mode) => {
    setPortalMode(mode);
    localStorage.setItem('portalMode', mode);
  };

  const updateSimpleView = (view) => {
    setSimpleView(view);
    localStorage.setItem('simpleView', view ? 'true' : 'false');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      portalMode,
      setPortalMode: updatePortalMode,
      simpleView,
      setSimpleView: updateSimpleView,
      login,
      logout,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}
