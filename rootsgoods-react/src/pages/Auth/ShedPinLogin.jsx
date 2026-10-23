import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import { KeyRound, ArrowLeft, Delete } from 'lucide-react';
import logo from '../../assets/logos/logo.png';

export const ShedPinLogin = () => {
  const [farmCode, setFarmCode] = useState('farmer01');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginWorkerWithPin } = useAuth();
  const navigate = useNavigate();

  const handlePressNum = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = (currentPin) => {
    try {
      loginWorkerWithPin(farmCode, currentPin);
      navigate('/worker/tasks');
    } catch (err) {
      setError(err.message);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col justify-between items-center p-4">
      {/* Top Bar */}
      <div className="w-full max-w-xs flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/login')}
          className="p-2 text-ink-5 hover:text-white flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Portal Login</span>
        </button>

        <div className="bg-white/10 px-2.5 py-1 rounded text-[11px] font-mono text-brand-500 font-bold">
          Farm Phone
        </div>
      </div>

      {/* Center Phone Numpad */}
      <div className="w-full max-w-xs space-y-6 text-center my-auto">
        <div className="space-y-1">
          <img src={logo} alt="RootsGoods" className="h-8 mx-auto object-contain brightness-0 invert opacity-90" />
          <h2 className="text-lg font-bold">Shed Worker PIN</h2>
          <p className="text-xs text-ink-5">Enter your 4-digit farm phone code</p>
        </div>

        {/* Farm selector */}
        <div className="text-left bg-white/5 border border-white/10 rounded-btn p-2">
          <label className="text-[10px] uppercase font-bold text-ink-5 block mb-1">
            Active Farm
          </label>
          <select
            value={farmCode}
            onChange={(e) => setFarmCode(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="farmer01" className="text-ink">farmer01 (Gokak Integrated Farm)</option>
            <option value="layer01" className="text-ink">layer01 (Barwala Layer Farm)</option>
          </select>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? 'bg-brand-500 border-brand-500 scale-110 shadow-sm'
                  : 'border-white/30 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && <div className="text-xs text-status-danger font-semibold">{error}</div>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handlePressNum(n)}
              className="h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-brand-500 active:text-brand-950 font-bold text-xl transition-all flex items-center justify-center select-none"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePressNum(0)}
            className="h-14 rounded-full bg-white/10 hover:bg-white/20 active:bg-brand-500 active:text-brand-950 font-bold text-xl transition-all flex items-center justify-center select-none"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all flex items-center justify-center select-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Sample PIN Hints */}
      <div className="w-full max-w-xs text-center text-[11px] text-ink-5 py-2">
        <p>Demo PINs: Ravi: <b className="text-white">1111</b> · Mallappa: <b className="text-white">2222</b> · Shivu: <b className="text-white">3333</b></p>
      </div>
    </div>
  );
};
