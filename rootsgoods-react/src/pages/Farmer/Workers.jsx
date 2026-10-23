import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Plus, User, KeyRound, Home } from 'lucide-react';

export const Workers = () => {
  const { workers, sheds, addWorker } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedSheds, setSelectedSheds] = useState([]);

  const toggleShed = (shedId) => {
    if (selectedSheds.includes(shedId)) {
      setSelectedSheds(selectedSheds.filter(id => id !== shedId));
    } else {
      setSelectedSheds([...selectedSheds, shedId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || pin.length !== 4) {
      alert('Please enter worker name and a 4-digit PIN');
      return;
    }
    addWorker({
      name,
      pin,
      sheds: selectedSheds,
    });
    setName('');
    setPin('');
    setSelectedSheds([]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Workers & PIN Logins')}</h2>
          <p className="text-xs text-ink-3">
            {workers.length} {t('registered shed workers on farm phone')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Add Worker')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {workers.map((w) => {
          const assignedSheds = sheds.filter(s => (w.sheds || []).includes(s.id));
          return (
            <Card key={w.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-900 border border-brand-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-ink truncate">{w.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {assignedSheds.map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1 text-[10px] bg-surface-bg px-2 py-0.5 rounded border border-surface-line text-ink-3 font-medium">
                        <Home className="w-2.5 h-2.5" />
                        {s.name}
                      </span>
                    ))}
                    {assignedSheds.length === 0 && (
                      <span className="text-[10px] text-ink-4">No shed assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-surface-bg border border-surface-line px-2.5 py-1 rounded font-mono text-xs font-bold text-ink flex-shrink-0">
                <KeyRound className="w-3 h-3 text-brand-800" />
                <span>{w.pin}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Worker Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Add Farm Worker')}
        subtitle={t('Create worker identity and 4-digit PIN for farm phone')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Worker Name')}
            placeholder="e.g. Anand"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label={t('4-digit PIN')}
            type="password"
            maxLength={4}
            placeholder="e.g. 5566"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            hint="For farm phone login"
            required
          />

          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-1.5">
              {t('Assign Sheds')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sheds.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleShed(s.id)}
                  className={`p-2.5 border rounded-btn text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                    selectedSheds.includes(s.id)
                      ? 'border-brand-800 bg-brand-50 text-brand-900'
                      : 'border-surface-line bg-white text-ink-3 hover:bg-surface-bg'
                  }`}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-75">{s.birds} birds</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Save Worker')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
