import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { BREEDS } from '../../constants/poultry';
import { nf } from '../../utils/formatters';
import { Plus, Home, Users } from 'lucide-react';

export const ShedsBirds = () => {
  const { sheds, addShed } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState(BREEDS[0]);
  const [birds, setBirds] = useState('');
  const [age, setAge] = useState('');
  const [capacity, setCapacity] = useState('4000');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !birds) return;
    addShed({
      name,
      breed,
      birds: Number(birds),
      age_weeks: Number(age) || 0,
      capacity: Number(capacity) || 4000,
    });
    setName('');
    setBirds('');
    setAge('');
    setModalOpen(false);
  };

  const totalBirds = sheds.reduce((sum, s) => sum + s.birds, 0);
  const totalCapacity = sheds.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Sheds & Birds')}</h2>
          <p className="text-xs text-ink-3">
            {sheds.length} {t('sheds')} · {nf(totalBirds)} / {nf(totalCapacity)} {t('birds capacity')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Add Shed')}</span>
        </Button>
      </div>

      <div className="space-y-3">
        {sheds.map((shed) => {
          const occupancyPct = shed.capacity > 0 ? Math.min(100, Math.round((shed.birds / shed.capacity) * 100)) : 0;
          return (
            <Card key={shed.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center font-bold">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-ink">{shed.name}</h3>
                    <span className="text-[11px] text-ink-3">{shed.age_weeks} weeks old</span>
                  </div>
                </div>
                <Badge tone="brand">{shed.breed}</Badge>
              </div>

              {/* Occupancy bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-ink-3">{t('Flock Size')}</span>
                  <span className="font-mono font-bold text-ink">
                    {nf(shed.birds)} <span className="text-ink-4">/ {nf(shed.capacity)}</span>
                  </span>
                </div>
                <div className="w-full bg-surface-bg rounded-full h-2 overflow-hidden border border-surface-line">
                  <div
                    className="bg-brand-700 h-full rounded-full transition-all"
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Shed Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Add New Shed')}
        subtitle={t('Configure shed capacity and flock details')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Shed Name')}
            placeholder="e.g. Shed 3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label={t('Breed')}
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            options={BREEDS}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Initial Birds')}
              type="number"
              placeholder="e.g. 4000"
              value={birds}
              onChange={(e) => setBirds(e.target.value)}
              required
            />
            <Input
              label={t('Age (weeks)')}
              type="number"
              placeholder="e.g. 20"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <Input
            label={t('Capacity')}
            type="number"
            placeholder="e.g. 4000"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Create Shed')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
