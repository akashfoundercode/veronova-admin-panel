import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, RotateCcw, Smartphone, Shield, User, Stethoscope, Factory, Building2 } from 'lucide-react';

export const DemoDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signInAs, loginWorkerWithPin, resetAllData } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (accountCode, path) => {
    signInAs(accountCode);
    setIsOpen(false);
    navigate(path);
  };

  const handleWorkerSelect = (farmCode, pin) => {
    try {
      loginWorkerWithPin(farmCode, pin);
      setIsOpen(false);
      navigate('/worker/tasks');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to clean pilot seed state?')) {
      resetAllData();
      setIsOpen(false);
      navigate('/farmer/today');
    }
  };

  return (
    <div className="fixed left-3 bottom-16 sm:bottom-6 z-40 select-none font-sans">
      {isOpen && (
        <div className="mb-2 w-72 bg-white border border-surface-line rounded-card p-3.5 shadow-modal text-left animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-line">
            <span className="text-xs font-bold text-ink">Pilot Role Switcher</span>
            <span className="text-[10px] text-brand-800 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Browser Demo
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => handleRoleSelect('farmer01', '/farmer/today')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4 text-brand-800" />
              <div>
                <div className="font-bold text-ink">Integrated farmer</div>
                <div className="text-[11px] text-ink-3">farmer01 · Sheds & Maize</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('layer01', '/farmer/today')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4 text-brand-800" />
              <div>
                <div className="font-bold text-ink">Layer farmer</div>
                <div className="text-[11px] text-ink-3">layer01 · Feed & Layers</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('vet01', '/vet/reports')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-status-blue" />
              <div>
                <div className="font-bold text-ink">Veterinarian</div>
                <div className="text-[11px] text-ink-3">vet01 · Dr. Ramesh Kulkarni</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('admin', '/admin/accounts')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4 text-ink" />
              <div>
                <div className="font-bold text-ink">Admin</div>
                <div className="text-[11px] text-ink-3">Pilot accounts governance</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('feed01', '/supplier/mill')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <Factory className="w-4 h-4 text-status-warn" />
              <div>
                <div className="font-bold text-ink">Feed Mill Manufacturer</div>
                <div className="text-[11px] text-ink-3">feed01 · Mill profile</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('meds01', '/supplier/medicine')}
              className="w-full text-left p-2 rounded-btn hover:bg-brand-50 hover:border-brand-500 border border-transparent flex items-center gap-2 transition-colors"
            >
              <Building2 className="w-4 h-4 text-status-warn" />
              <div>
                <div className="font-bold text-ink">Medicine Supplier</div>
                <div className="text-[11px] text-ink-3">meds01 · Company profile</div>
              </div>
            </button>

            {/* Shed Worker Phone Section */}
            <div className="pt-2 mt-2 border-t border-surface-line">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-2 mb-1 px-1">
                <Smartphone className="w-3.5 h-3.5 text-brand-700" />
                <span>Shed Worker Phone (PIN)</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => handleWorkerSelect('farmer01', '1111')}
                  className="px-2 py-1.5 text-center bg-surface-bg hover:bg-brand-100 rounded text-xs font-semibold"
                >
                  Ravi (1111)
                </button>
                <button
                  onClick={() => handleWorkerSelect('farmer01', '2222')}
                  className="px-2 py-1.5 text-center bg-surface-bg hover:bg-brand-100 rounded text-xs font-semibold"
                >
                  Mallappa (2222)
                </button>
                <button
                  onClick={() => handleWorkerSelect('farmer01', '3333')}
                  className="px-2 py-1.5 text-center bg-surface-bg hover:bg-brand-100 rounded text-xs font-semibold"
                >
                  Shivu (3333)
                </button>
              </div>
            </div>

            {/* Reset button */}
            <div className="pt-2 border-t border-surface-line">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-status-danger hover:bg-red-50 rounded font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-ink text-white rounded-btn text-xs font-bold shadow-modal hover:bg-ink-2 transition-all active:scale-95"
      >
        <span>Demo Roles</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
