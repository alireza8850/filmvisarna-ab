import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  checkLoginStatus: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);      // skapar en kontext som antingen är UserContextType eller undefined 

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const hasFetched = useRef(false);

  const login = (userData: User) => {        // uppdaterar user_state med inloggningsdata 
    setUser(userData);
  };

  const logout = async () => {              // skickar Delete till servern för att logga ut
    try {
      await fetch('/api/login', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const checkLoginStatus = async () => {   //kontrollerar om user är inloggad och använder cookies och uppdaterar user-state
    try {
      const response = await fetch('/api/login', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check login status error:', error);
      setUser(null);
    }
  };

  useEffect(() => {         //säkerställer att vi kollar inloggningsstatus när vi startar sidan
  if (hasFetched.current) return; // kollar om det är true ,avbryter, om loginstatus redan hämtat
  hasFetched.current = true; //sätt till true så att inte köra igen
    checkLoginStatus();
  }, []);

  return (             // lägger in data i UserContext.Provider för att datan ska vara tillgänlig till alla komponenter som ligger inuti
    <UserContext.Provider value={{ user, login, logout, checkLoginStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {   // ett sätt att hämta ut innehållet från kontexten
  const context = useContext(UserContext);
  if (context === undefined) {     //säkerhetskontroll
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};