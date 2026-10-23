import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { fmtDate } from '../../utils/formatters';
import { Stethoscope, Phone, MessageSquare, CheckCircle, ExternalLink } from 'lucide-react';

export const MyVet = () => {
  const { currentUser } = useAuth();
  const { reports } = useFarm();
  const { t } = useTranslation();

  const vetName = currentUser?.farm?.vet_name || 'Dr. Ramesh Kulkarni';
  const vetPhone = currentUser?.farm?.vet_phone || '+91 98450 12345';

  const answeredReports = reports.filter(r => r.reply_dx);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('Assigned Veterinarian')}</h2>
        <p className="text-xs text-ink-3">
          {t('Dedicated poultry doctor linked to your farm for clinical consultations')}
        </p>
      </div>

      {/* Vet Profile Card */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-status-blue flex items-center justify-center font-bold text-base flex-shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-ink truncate">{vetName}</h3>
              <Badge tone="ok">Verified</Badge>
            </div>
            <p className="text-xs text-ink-3 mt-0.5">B.V.Sc & A.H · Poultry Specialist</p>
            <p className="text-[11px] font-mono text-ink-4">KVC Reg: KVC-8942</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-line">
          <a
            href={`tel:${vetPhone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-2 py-2.5 bg-surface-bg hover:bg-brand-50 border border-surface-line rounded-btn text-xs font-bold text-ink transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-800" />
            <span>Call Doctor</span>
          </a>

          <a
            href={`https://wa.me/${vetPhone.replace(/[^0-9]/g, '')}?text=Hello%20Doctor,%20consultation%20request%20from%20farm%20${currentUser?.farm?.code || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-btn text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </Card>

      {/* Consultation History */}
      <div>
        <h3 className="text-xs font-bold text-ink-3 uppercase tracking-wider mb-2">
          {t('Past Consultation Diagnoses')}
        </h3>

        {answeredReports.length === 0 ? (
          <Card className="p-6 text-center text-xs text-ink-3">
            No past veterinary consultations on record.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {answeredReports.map((r) => (
              <Card key={r.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-surface-line pb-1.5">
                  <span className="font-bold text-ink">{r.shed_name}</span>
                  <span className="text-[10px] text-ink-4">{fmtDate(r.replied_at)}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-green-950 block">Dx: {r.reply_dx}</span>
                  <p className="text-xs text-ink-2 mt-1 leading-relaxed bg-surface-bg p-2 rounded">
                    {r.reply_advice}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
