import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  userId: string | null;
  login: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const login = (id: string) => {
    setUserId(id);
    localStorage.setItem('currentUserId', id);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('currentUserId');
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
