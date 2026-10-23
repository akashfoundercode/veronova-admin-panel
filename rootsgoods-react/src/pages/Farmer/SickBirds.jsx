import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select, Textarea } from '../../components/common/Input';
import { CLINICAL_SIGNS } from '../../constants/poultry';
import { fmtDate, fmtTime } from '../../utils/formatters';
import { AlertTriangle, Plus, Stethoscope, MessageSquare, CheckCircle, Home } from 'lucide-react';

export const SickBirds = () => {
  const { reports, sheds, addReport } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [shedId, setShedId] = useState(sheds[0]?.id || '');
  const [sick, setSick] = useState('');
  const [dead, setDead] = useState('');
  const [signs, setSigns] = useState([]);
  const [note, setNote] = useState('');

  const toggleSign = (sign) => {
    if (signs.includes(sign)) {
      setSigns(signs.filter(s => s !== sign));
    } else {
      setSigns([...signs, sign]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shedId || !sick) return;
    addReport({
      shed_id: shedId,
      sick: Number(sick) || 0,
      dead: Number(dead) || 0,
      signs,
      note,
    });
    setSick('');
    setDead('');
    setSigns([]);
    setNote('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Sick Birds & Vet Reports')}</h2>
          <p className="text-xs text-ink-3">
            {reports.length} {t('clinical cases documented')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="danger" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Report Sick Birds')}</span>
        </Button>
      </div>

      <div className="space-y-3">
        {reports.map((rep) => {
          const isAnswered = !!rep.reply_dx;
          return (
            <Card key={rep.id} className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-line pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-ink">{fmtDate(rep.created_at)}</span>
                  <span className="text-[10px] bg-surface-bg border border-surface-line px-1.5 py-0.5 rounded text-ink-3 font-semibold flex items-center gap-1">
                    <Home className="w-2.5 h-2.5" />
                    {rep.shed_name}
                  </span>
                </div>
                <Badge tone={isAnswered ? 'ok' : 'warn'}>
                  {isAnswered ? t('Answered by Vet') : t('Awaiting Vet')}
                </Badge>
              </div>

              {/* Sick count & signs */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-ink-4 block text-[10px]">{t('Sick Birds')}</span>
                    <span className="font-bold font-mono text-status-warn text-sm">{rep.sick}</span>
                  </div>
                  <div>
                    <span className="text-ink-4 block text-[10px]">{t('Mortality')}</span>
                    <span className="font-bold font-mono text-status-danger text-sm">{rep.dead}</span>
                  </div>
                </div>

                {/* Symptoms chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rep.signs.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {rep.note && (
                  <p className="text-ink-2 bg-surface-bg p-2.5 rounded-btn italic text-xs">
                    "{rep.note}"
                  </p>
                )}
              </div>

              {/* Vet Reply Card */}
              {isAnswered ? (
                <div className="bg-green-50/70 border border-green-200 rounded-btn p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-green-900 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-status-ok" />
                      {rep.vet_name}
                    </span>
                    <span className="text-[10px] text-green-700">{fmtTime(rep.replied_at)}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-green-950">Diagnosis: </span>
                    <span className="text-green-900">{rep.reply_dx}</span>
                  </div>
                  <div className="text-xs text-green-800 leading-relaxed bg-white/60 p-2 rounded">
                    {rep.reply_advice}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-ink-3 flex items-center gap-1.5 bg-surface-bg p-2 rounded text-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warn" />
                  <span>Report submitted to {rep.vet_name || 'linked veterinarian'}.</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Report Sick Birds Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Report Sick Birds')}
        subtitle={t('Flag symptoms and mortality for veterinarian triage')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Select
            label={t('Select Shed')}
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Number of Sick Birds')}
              type="number"
              placeholder="e.g. 30"
              value={sick}
              onChange={(e) => setSick(e.target.value)}
              required
            />
            <Input
              label={t('Dead in past 24 hrs')}
              type="number"
              placeholder="e.g. 5"
              value={dead}
              onChange={(e) => setDead(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-1.5">
              {t('Observed Clinical Signs')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CLINICAL_SIGNS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSign(s)}
                  className={`p-2 border rounded-btn text-xs font-semibold text-left transition-colors ${
                    signs.includes(s)
                      ? 'border-status-warn bg-amber-50 text-amber-950 font-bold'
                      : 'border-surface-line bg-white text-ink-3 hover:bg-surface-bg'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label={t('Observations / Notes')}
            placeholder="Describe bird behavior, droppings, or affected areas..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="danger" type="submit" block>
              {t('Send to Vet')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
