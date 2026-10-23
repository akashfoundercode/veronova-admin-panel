import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fmtDate, nf } from '../../utils/formatters';
import { Plus, Egg, Skull, Utensils, Home } from 'lucide-react';

export const DailyRecords = () => {
  const { daily, sheds, addDailyEntry } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [shedId, setShedId] = useState(sheds[0]?.id || '');
  const [eggs, setEggs] = useState('');
  const [deaths, setDeaths] = useState('');
  const [feed, setFeed] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shedId) return;
    addDailyEntry({
      shed_id: shedId,
      date,
      eggs: Number(eggs) || 0,
      deaths: Number(deaths) || 0,
      feed_kg: Number(feed) || 0,
    });
    setEggs('');
    setDeaths('');
    setFeed('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Daily Farm Records')}</h2>
          <p className="text-xs text-ink-3">
            {daily.length} {t('routine logs recorded')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Add Entry')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {daily.map((rec) => {
          const shed = sheds.find(s => s.id === rec.shed_id);
          return (
            <Card key={rec.id} className="p-3.5">
              <div className="flex items-center justify-between border-b border-surface-line pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink">{fmtDate(rec.date)}</span>
                  <span className="text-[10px] bg-surface-bg border border-surface-line px-1.5 py-0.5 rounded text-ink-3 font-semibold flex items-center gap-1">
                    <Home className="w-2.5 h-2.5" />
                    {shed?.name || `Shed #${rec.shed_id}`}
                  </span>
                </div>
                <span className="text-[11px] text-ink-4">By: {rec.by_name || 'Worker'}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                    <Egg className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-4 block">{t('Eggs')}</span>
                    <span className="font-bold font-mono text-ink">{nf(rec.eggs)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-50 text-status-danger flex items-center justify-center flex-shrink-0">
                    <Skull className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-4 block">{t('Mortality')}</span>
                    <span className="font-bold font-mono text-ink">{rec.deaths}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-surface-bg text-ink-3 flex items-center justify-center flex-shrink-0">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-4 block">{t('Feed (kg)')}</span>
                    <span className="font-bold font-mono text-ink">{rec.feed_kg}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Record Daily Production')}
        subtitle={t('Enter egg collection and shed mortality')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Select
            label={t('Shed')}
            value={shedId}
            onChange={(e) => setShedId(e.target.value)}
            required
          >
            {sheds.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.birds} birds)
              </option>
            ))}
          </Select>

          <Input
            label={t('Eggs Collected')}
            type="number"
            placeholder="e.g. 3600"
            value={eggs}
            onChange={(e) => setEggs(e.target.value)}
            required
          />

          <Input
            label={t('Mortality (Dead birds)')}
            type="number"
            placeholder="e.g. 2"
            value={deaths}
            onChange={(e) => setDeaths(e.target.value)}
            required
          />

          <Input
            label={t('Feed Given (kg)')}
            type="number"
            placeholder="e.g. 440"
            value={feed}
            onChange={(e) => setFeed(e.target.value)}
            required
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Save Log')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
