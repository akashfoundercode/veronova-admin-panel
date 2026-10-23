import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { ISSUE_CATEGORIES } from '../../constants/poultry';
import { AlertTriangle, CheckCircle, Flame, AlertCircle } from 'lucide-react';

export const WorkerReportProblem = () => {
  const { activeShed } = useAuth();
  const { addIssue } = useFarm();
  const { t } = useTranslation();

  const [category, setCategory] = useState(ISSUE_CATEGORIES[0].id);
  const [urgency, setUrgency] = useState('normal'); // normal, urgent
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note) return;
    addIssue({
      shed_id: activeShed?.id || 1,
      category,
      urgency,
      note,
    });
    setNote('');
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('Report a Problem')}</h2>
        <p className="text-xs text-ink-3">
          For shed: <b className="text-brand-900">{activeShed ? activeShed.name : 'General Farm'}</b>
        </p>
      </div>

      {sent && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded-btn text-xs text-green-900 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-status-ok flex-shrink-0" />
          <span>Problem report sent to farm owner immediately!</span>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-ink block mb-2">
              {t('1. What kind of problem is it?')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 border rounded-btn text-xs font-bold text-left transition-all ${
                    category === cat.id
                      ? 'border-brand-800 bg-brand-50 text-brand-950 shadow-xs ring-1 ring-brand-800'
                      : 'border-surface-line bg-white text-ink-3 hover:bg-surface-bg'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink block mb-2">
              {t('2. How urgent is it?')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2.5 px-3 border rounded-btn text-xs font-bold text-center transition-all ${
                  urgency === 'normal'
                    ? 'border-brand-800 bg-brand-50 text-brand-900 ring-1 ring-brand-800'
                    : 'border-surface-line bg-white text-ink-3'
                }`}
              >
                Normal (Fix today)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`py-2.5 px-3 border rounded-btn text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  urgency === 'urgent'
                    ? 'border-status-danger bg-red-50 text-status-danger ring-1 ring-status-danger'
                    : 'border-surface-line bg-white text-ink-3'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Urgent (Needs Help Now)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink block mb-1">
              {t('3. Describe the problem')}
            </label>
            <Textarea
              placeholder="e.g. Fan in row 2 stopped working, smell is increasing..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="pt-2">
            <Button
              variant={urgency === 'urgent' ? 'danger' : 'primary'}
              size="lg"
              type="submit"
              block
              className="text-base font-bold"
            >
              {t('Send Alert to Farmer')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
