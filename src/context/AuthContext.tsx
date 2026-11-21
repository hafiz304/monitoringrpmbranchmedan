import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  role: string;
  branch: string;
  avatar: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithName: (name: string, role?: string) => void;
  logout: () => void;
}

export const SUGGESTED_NAMES = [
  { name: 'Mahmud Pratama', role: 'Senior Retail Analyst', avatar: 'MP' },
  { name: 'Budi Indra', role: 'Area Manager (AM BIN)', avatar: 'BI' },
  { name: 'Benni Syahputra', role: 'Area Coordinator (AC)', avatar: 'BS' },
  { name: 'Siti Rahma', role: 'Store Performance Specialist', avatar: 'SR' },
  { name: 'Feri Irawan', role: 'Area Manager (AM FEI)', avatar: 'FI' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('alfamidi_rpm_user_name');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginWithName = (name: string, role = 'Retail Analyst') => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Get avatar initials
    const words = trimmed.split(' ');
    const initials = words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : trimmed.slice(0, 2).toUpperCase();

    const emailName = trimmed.toLowerCase().replace(/\s+/g, '.');

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: trimmed,
      role: role || 'Retail Analyst',
      branch: 'Alfamidi Branch Medan',
      avatar: initials,
      email: `${emailName}@alfamidi.co.id`,
    };

    setUser(newUser);
    localStorage.setItem('alfamidi_rpm_user_name', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alfamidi_rpm_user_name');
    try {
      sessionStorage.removeItem('alfamidi_datamgmt_unlocked');
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
