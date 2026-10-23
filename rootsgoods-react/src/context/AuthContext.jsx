import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStore, resetStore } from '../services/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rg_react_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeShed, setActiveShed] = useState(() => {
    try {
      const saved = localStorage.getItem('rg_react_active_shed');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rg_react_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rg_react_user');
      localStorage.removeItem('rg_react_active_shed');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeShed) {
      localStorage.setItem('rg_react_active_shed', JSON.stringify(activeShed));
    } else {
      localStorage.removeItem('rg_react_active_shed');
    }
  }, [activeShed]);

  // Default to farmer01 on initial visit if not logged in
  useEffect(() => {
    if (!currentUser) {
      signInAs('farmer01');
    }
  }, []);

  const signInAs = (accountCode) => {
    const db = getStore();
    if (accountCode === 'farmer01') {
      const user = db.users.find(u => u.code === 'farmer01');
      const farm = db.farms.find(f => f.code === 'farmer01');
      setCurrentUser({ kind: 'user', role: 'INTEG', name: user.name, email: user.email, farm });
      setActiveShed(null);
    } else if (accountCode === 'layer01') {
      const user = db.users.find(u => u.code === 'layer01');
      const farm = db.farms.find(f => f.code === 'layer01');
      setCurrentUser({ kind: 'user', role: 'LAYER', name: user.name, email: user.email, farm });
      setActiveShed(null);
    } else if (accountCode === 'vet01') {
      const user = db.users.find(u => u.email === 'vet01');
      setCurrentUser({ kind: 'user', role: 'VET', name: user.name, email: user.email });
      setActiveShed(null);
    } else if (accountCode === 'admin') {
      const user = db.users.find(u => u.email === 'admin');
      setCurrentUser({ kind: 'user', role: 'ADMIN', name: user.name, email: user.email });
      setActiveShed(null);
    } else if (accountCode === 'feed01') {
      const user = db.users.find(u => u.email === 'feed01');
      setCurrentUser({ kind: 'user', role: 'MILL', name: user.name, email: user.email });
      setActiveShed(null);
    } else if (accountCode === 'meds01') {
      const user = db.users.find(u => u.email === 'meds01');
      setCurrentUser({ kind: 'user', role: 'MEDS', name: user.name, email: user.email });
      setActiveShed(null);
    }
  };

  const loginWithCredentials = (email, password) => {
    const db = getStore();
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('User not found. Try demo accounts: farmer01, layer01, vet01, admin');
    }
    const farm = db.farms.find(f => f.code === user.code);
    setCurrentUser({
      kind: 'user',
      role: user.role,
      name: user.name,
      email: user.email,
      farm: farm || null
    });
    setActiveShed(null);
  };

  const loginWorkerWithPin = (farmCode, pin) => {
    const db = getStore();
    const farm = db.farms.find(f => f.code === farmCode);
    if (!farm) throw new Error('Farm ID not found');
    const worker = db.workers.find(w => w.farm_id === farm.id && w.pin === pin);
    if (!worker) throw new Error('Incorrect worker PIN (try 1111, 2222, or 3333)');

    const workerSheds = db.sheds.filter(s => worker.sheds.includes(s.id));
    setCurrentUser({
      kind: 'worker',
      role: 'WORKER',
      name: worker.name,
      workerId: worker.id,
      farm,
      sheds: workerSheds
    });
    // Default active shed to first assigned
    if (workerSheds.length > 0) {
      setActiveShed(workerSheds[0]);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveShed(null);
  };

  const resetAllData = () => {
    resetStore();
    signInAs('farmer01');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeShed,
        setActiveShed,
        signInAs,
        loginWithCredentials,
        loginWorkerWithPin,
        logout,
        resetAllData,
        isAuthenticated: !!currentUser,
        isFarmer: currentUser?.kind === 'user' && ['INTEG', 'LAYER'].includes(currentUser?.role),
        isWorker: currentUser?.kind === 'worker',
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
