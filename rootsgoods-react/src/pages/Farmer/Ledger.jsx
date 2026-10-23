import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { fmtDate, inr } from '../../utils/formatters';
import { ArrowDownLeft, ArrowUpRight, BookOpen, Download } from 'lucide-react';

export const Ledger = () => {
  const { ledger } = useFarm();
  const { t } = useTranslation();

  const totalCredits = ledger.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalDebits = ledger.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + (l.amount || 0), 0);
  const netBalance = totalCredits - totalDebits;

  return (
    <div className="space-y-4">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          label={t('Total Revenue')}
          value={inr(totalCredits)}
          sub={t('Egg sales & receipts')}
          tone="ok"
        />
        <StatCard
          label={t('Expenses')}
          value={inr(totalDebits)}
          sub={t('Feed, maize, meds')}
          tone="warn"
        />
        <StatCard
          label={t('Net Position')}
          value={inr(netBalance)}
          sub={netBalance >= 0 ? t('Operating surplus') : t('Deficit')}
          tone={netBalance >= 0 ? 'brand' : 'danger'}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">{t('Transaction History')}</span>
        <button
          onClick={() => alert('Ledger exported as CSV')}
          className="flex items-center gap-1 text-xs text-brand-800 font-bold hover:underline"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('Export')}</span>
        </button>
      </div>

      <Card className="divide-y divide-surface-line">
        {ledger.map((tx) => {
          const isCredit = tx.type === 'CREDIT';
          return (
            <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCredit ? 'bg-green-50 text-status-ok' : 'bg-amber-50 text-status-warn'
                  }`}
                >
                  {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-ink truncate leading-tight">{tx.desc}</h4>
                  <span className="text-[10px] text-ink-3 font-mono">{fmtDate(tx.date)}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`font-bold font-mono text-sm block ${isCredit ? 'text-status-ok' : 'text-ink'}`}>
                  {isCredit ? '+' : '-'}{inr(tx.amount)}
                </span>
                <span className="text-[10px] uppercase font-bold text-ink-4 tracking-wider">
                  {tx.type}
                </span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};
