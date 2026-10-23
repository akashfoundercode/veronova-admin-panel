import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import { fmtDate, fmtTime } from '../../utils/formatters';
import { Stethoscope, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

export const SickBirdReports = () => {
  const { allReports, replyReport } = useFarm();
  const { t } = useTranslation();

  const [activeReport, setActiveReport] = useState(null);
  const [dx, setDx] = useState('');
  const [advice, setAdvice] = useState('');

  const openReplyModal = (report) => {
    setActiveReport(report);
    setDx(report.reply_dx || '');
    setAdvice(report.reply_advice || '');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!activeReport || !dx || !advice) return;
    replyReport(activeReport.id, dx, advice);
    setActiveReport(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">{t('Sick-Bird Clinical Triage')}</h2>
        <p className="text-xs text-ink-3">
          {t('Incoming health incident reports from your linked poultry farms')}
        </p>
      </div>

      <div className="space-y-3">
        {allReports.map((rep) => {
          const isAnswered = !!rep.reply_dx;
          return (
            <Card key={rep.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-surface-line pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-ink">{rep.farm_code} · {rep.shed_name}</h3>
                    <Badge tone={isAnswered ? 'ok' : 'danger'}>
                      {isAnswered ? 'Answered' : 'Action Required'}
                    </Badge>
                  </div>
                  <span className="text-xs text-ink-3">{fmtDate(rep.created_at)} at {fmtTime(rep.created_at)}</span>
                </div>

                <Button
                  size="sm"
                  variant={isAnswered ? 'secondary' : 'primary'}
                  onClick={() => openReplyModal(rep)}
                >
                  {isAnswered ? 'Edit Advice' : 'Respond to Farm'}
                </Button>
              </div>

              {/* Counts & Symptoms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-bg p-3 rounded-btn text-xs">
                <div>
                  <span className="text-[10px] text-ink-4 block uppercase font-bold">{t('Sick Count')}</span>
                  <span className="font-bold font-mono text-status-warn text-base">{rep.sick} birds</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-4 block uppercase font-bold">{t('Mortality')}</span>
                  <span className="font-bold font-mono text-status-danger text-base">{rep.dead} birds</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-ink-4 block uppercase font-bold">{t('Clinical Signs')}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rep.signs.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {rep.note && (
                <div className="text-xs text-ink-2 bg-white border border-surface-line p-2.5 rounded">
                  <span className="font-bold text-ink">Farmer Note: </span>
                  <span>{rep.note}</span>
                </div>
              )}

              {/* Past Diagnosis */}
              {isAnswered && (
                <div className="bg-green-50/80 border border-green-200 rounded p-3 text-xs space-y-1">
                  <span className="font-bold text-green-950 block">Your Prescribed Diagnosis: {rep.reply_dx}</span>
                  <p className="text-green-900 leading-relaxed">{rep.reply_advice}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={!!activeReport}
        onClose={() => setActiveReport(null)}
        title="Provide Clinical Diagnosis & Treatment"
        subtitle={`Case for ${activeReport?.farm_code} · ${activeReport?.shed_name}`}
      >
        <form onSubmit={handleSendReply} className="space-y-3.5">
          <Input
            label="Presumptive Diagnosis"
            placeholder="e.g. Infectious Bronchitis or Chronic Respiratory Disease"
            value={dx}
            onChange={(e) => setDx(e.target.value)}
            required
          />

          <Textarea
            label="Veterinary Advice & Treatment Instructions"
            placeholder="Specify medication, dosage in drinking water, biosecurity steps, and next follow-up date..."
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            rows={4}
            required
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setActiveReport(null)} block>
              Cancel
            </Button>
            <Button variant="primary" type="submit" block>
              Send Prescription to Farm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
