import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'cust_849201',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    role: 'customer'
  });
  const [token, setToken] = useState('mock_jwt_token_payload');
  const [portalMode, setPortalMode] = useState('customer'); // 'customer' | 'hero'
  const [simpleView, setSimpleView] = useState(false); // Accessibility toggle

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      portalMode,
      setPortalMode,
      simpleView,
      setSimpleView,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
