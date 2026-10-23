import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Egg, Skull, Utensils, CheckCircle } from 'lucide-react';

export const WorkerDailyEntry = () => {
  const { currentUser, activeShed } = useAuth();
  const { addDailyEntry } = useFarm();
  const { t } = useTranslation();

  const [eggs, setEggs] = useState('');
  const [deaths, setDeaths] = useState('');
  const [feed, setFeed] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeShed) {
      alert('Please select an active shed first from the top bar');
      return;
    }
    addDailyEntry({
      shed_id: activeShed.id,
      eggs: Number(eggs) || 0,
      deaths: Number(deaths) || 0,
      feed_kg: Number(feed) || 0,
      by_name: currentUser?.name || 'Worker',
    });
    setEggs('');
    setDeaths('');
    setFeed('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('Daily Shed Entry')}</h2>
        <p className="text-xs text-ink-3">
          Logging for: <b className="text-brand-900">{activeShed ? activeShed.name : 'Select Shed'}</b>
        </p>
      </div>

      {submitted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-btn text-xs text-green-900 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-status-ok flex-shrink-0" />
          <span>Daily entry saved successfully for {activeShed?.name}!</span>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink flex items-center gap-2 mb-1.5">
              <Egg className="w-4 h-4 text-brand-800" />
              <span>{t('Eggs Collected (Count)')}</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 3650"
              value={eggs}
              onChange={(e) => setEggs(e.target.value)}
              className="text-lg font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink flex items-center gap-2 mb-1.5">
              <Skull className="w-4 h-4 text-status-danger" />
              <span>{t('Mortality (Dead birds found)')}</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 2"
              value={deaths}
              onChange={(e) => setDeaths(e.target.value)}
              className="text-lg font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-ink flex items-center gap-2 mb-1.5">
              <Utensils className="w-4 h-4 text-ink-3" />
              <span>{t('Feed Fed (kg or bags * 50)')}</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 450"
              value={feed}
              onChange={(e) => setFeed(e.target.value)}
              className="text-lg font-bold"
              required
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" size="lg" type="submit" block className="text-base font-bold">
              {t('Submit Daily Log')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
