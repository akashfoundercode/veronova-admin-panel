import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Smartphone, Lock } from 'lucide-react';
import logo from '../../assets/logos/logo.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials, signInAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      loginWithCredentials(email, password);
      // Route based on role
      navigate('/farmer/today');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickDemo = (accountCode, path) => {
    signInAs(accountCode);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <img src={logo} alt="RootsGoods" className="h-10 mx-auto object-contain" />
          <h1 className="text-xl font-bold text-ink tracking-tight">Poultry Operating System</h1>
          <p className="text-xs text-ink-3">Pilot Farm & Supply Chain Portal</p>
        </div>

        {/* Login Card */}
        <Card className="p-5 sm:p-6 shadow-modal">
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-status-danger text-xs rounded font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <Input
              label="Username or Email"
              placeholder="e.g. farmer01"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button variant="primary" type="submit" block size="lg" className="font-bold">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-surface-line">
            <span className="text-[11px] font-bold text-ink-3 uppercase tracking-wider block text-center mb-2">
              1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('farmer01', '/farmer/today')}
                className="p-2 border border-surface-line rounded-btn hover:bg-brand-50 hover:border-brand-500 font-semibold text-ink text-left"
              >
                Integrated Farmer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('layer01', '/farmer/today')}
                className="p-2 border border-surface-line rounded-btn hover:bg-brand-50 hover:border-brand-500 font-semibold text-ink text-left"
              >
                Layer Farmer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('vet01', '/vet/reports')}
                className="p-2 border border-surface-line rounded-btn hover:bg-brand-50 hover:border-brand-500 font-semibold text-ink text-left"
              >
                Veterinarian
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin', '/admin/accounts')}
                className="p-2 border border-surface-line rounded-btn hover:bg-brand-50 hover:border-brand-500 font-semibold text-ink text-left"
              >
                Administrator
              </button>
            </div>
          </div>
        </Card>

        {/* Switch to Shed Phone PIN login */}
        <div className="text-center">
          <button
            onClick={() => navigate('/pin-login')}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-800 hover:underline bg-white px-4 py-2.5 rounded-btn border border-surface-line shadow-xs"
          >
            <Smartphone className="w-4 h-4 text-brand-700" />
            <span>Farm Phone? Switch to Shed Worker PIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
