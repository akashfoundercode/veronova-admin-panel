import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fmtDate, today } from '../../utils/formatters';
import { HeartPulse, Plus, CheckCircle2, AlertCircle, Home } from 'lucide-react';

export const HealthSchedule = () => {
  const { health, sheds, toggleHealthGiven, addHealthItem } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [product, setProduct] = useState('');
  const [shedId, setShedId] = useState('');
  const [dueDate, setDueDate] = useState(today());
  const [dose, setDose] = useState('');
  const [withdrawal, setWithdrawal] = useState('0');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product || !dueDate) return;
    addHealthItem({
      product,
      shed_id: shedId || null,
      due_date: dueDate,
      dose,
      withdrawal_days: Number(withdrawal) || 0,
    });
    setProduct('');
    setShedId('');
    setDose('');
    setWithdrawal('0');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Health & Vaccine Schedules')}</h2>
          <p className="text-xs text-ink-3">
            {health.filter(h => !h.given).length} {t('pending medications/vaccines')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Add Item')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {health.map((item) => {
          const shed = sheds.find(s => s.id === item.shed_id);
          const isOverdue = !item.given && item.due_date < today();
          const isToday = !item.given && item.due_date === today();

          return (
            <Card
              key={item.id}
              className={`p-3.5 space-y-2.5 border-l-4 ${
                item.given
                  ? 'border-l-status-ok'
                  : isOverdue
                  ? 'border-l-status-danger'
                  : isToday
                  ? 'border-l-status-warn'
                  : 'border-l-brand-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => toggleHealthGiven(item.id)}
                    className={`w-6 h-6 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 transition-colors ${
                      item.given
                        ? 'bg-status-ok border-status-ok text-white'
                        : 'border-surface-line bg-white hover:border-brand-500'
                    }`}
                  >
                    {item.given && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={`text-sm font-bold text-ink ${item.given ? 'line-through text-ink-4' : ''}`}>
                      {item.product}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-3">
                      <span className="flex items-center gap-1 font-semibold text-ink-2">
                        <Home className="w-3 h-3 text-ink-4" />
                        {shed ? shed.name : 'All sheds'}
                      </span>
                      <span>·</span>
                      <span className="font-mono">Due: {fmtDate(item.due_date)}</span>
                    </div>
                  </div>
                </div>

                <Badge tone={item.given ? 'ok' : isOverdue ? 'danger' : isToday ? 'warn' : 'neutral'}>
                  {item.given ? t('Given') : isOverdue ? t('Overdue') : isToday ? t('Due Today') : t('Scheduled')}
                </Badge>
              </div>

              {/* Dose & withdrawal period */}
              <div className="bg-surface-bg p-2.5 rounded-btn text-xs space-y-1">
                {item.dose && (
                  <div>
                    <span className="font-semibold text-ink-2">{t('Dosage')}: </span>
                    <span className="text-ink-3">{item.dose}</span>
                  </div>
                )}
                {item.withdrawal_days > 0 && (
                  <div className="text-status-danger font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>No egg sale for {item.withdrawal_days} days after administration</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Health Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Schedule Vaccination / Medicine')}
        subtitle={t('Add scheduled treatment and egg withdrawal period')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Medicine or Vaccine Name')}
            placeholder="e.g. Lasota ND Booster"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />

          <Select
            label={t('Target Shed')}
            value={shedId}
            onChange={(e) => setShedId(e.target.value)}
          >
            <option value="">All Sheds</option>
            {sheds.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          <Input
            label={t('Due Date')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <Input
            label={t('Dose & Route')}
            placeholder="e.g. 1 dose / bird via drinking water"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            required
          />

          <Input
            label={t('Withdrawal Period ("No egg sale for X days")')}
            type="number"
            placeholder="0"
            value={withdrawal}
            onChange={(e) => setWithdrawal(e.target.value)}
            hint="Set 0 if safe for immediate egg sale"
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Add to Schedule')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
