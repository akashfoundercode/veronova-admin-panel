import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { fmtDate, inr, nf, today } from '../../utils/formatters';
import { Egg, Plus, DollarSign, AlertCircle } from 'lucide-react';

export const EggsSales = () => {
  const { sales, addEggSale } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [buyer, setBuyer] = useState('');
  const [petis, setPetis] = useState('');
  const [rate, setRate] = useState('945');
  const [paid, setPaid] = useState('');
  const [date, setDate] = useState(today());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!buyer || !petis || !rate) return;
    addEggSale({
      buyer,
      peti_count: Number(petis),
      rate_per_peti: Number(rate),
      paid_amount: Number(paid) || 0,
      date,
    });
    setBuyer('');
    setPetis('');
    setPaid('');
    setModalOpen(false);
  };

  const totalPetis = sales.reduce((sum, s) => sum + (s.peti_count || 0), 0);
  const totalEggs = totalPetis * 210;
  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalUnpaid = sales.reduce((sum, s) => sum + (s.unpaid_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          label={t('Total Sold')}
          value={inr(totalSalesAmount)}
          sub={`${nf(totalPetis)} ${t('peti')}`}
          tone="ok"
        />
        <StatCard
          label={t('Pending Owed')}
          value={inr(totalUnpaid)}
          sub={t('Unpaid by buyers')}
          tone={totalUnpaid > 0 ? 'danger' : 'neutral'}
        />
        <StatCard
          label={t('Egg Count')}
          value={nf(totalEggs)}
          sub="1 peti = 210 eggs"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">{t('Sales History')}</span>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Record Sale')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {sales.map((sale) => (
          <Card key={sale.id} className="p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-surface-line pb-2">
              <div>
                <h3 className="font-bold text-xs text-ink">{sale.buyer}</h3>
                <span className="text-[10px] text-ink-3">{fmtDate(sale.date)}</span>
              </div>
              <Badge tone={sale.unpaid_amount > 0 ? 'warn' : 'ok'}>
                {sale.unpaid_amount > 0 ? `Unpaid ${inr(sale.unpaid_amount)}` : 'Fully Paid'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-ink-4 block">{t('Quantity')}</span>
                <span className="font-bold font-mono text-ink">{sale.peti_count} Peti</span>
                <span className="text-[10px] text-ink-3 block">({nf(sale.peti_count * 210)} eggs)</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-4 block">{t('Rate / Peti')}</span>
                <span className="font-bold font-mono text-ink">{inr(sale.rate_per_peti)}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-4 block">{t('Total Sale')}</span>
                <span className="font-bold font-mono text-brand-900">{inr(sale.total_amount)}</span>
              </div>
            </div>

            {sale.unpaid_amount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs flex justify-between items-center text-amber-900">
                <span className="font-medium">Paid: {inr(sale.paid_amount)}</span>
                <span className="font-bold text-status-danger">Due: {inr(sale.unpaid_amount)}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Record Egg Sale Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Record Egg Sale')}
        subtitle={t('Calculate revenue using standard 1 Peti = 210 eggs (7 trays)')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Buyer / Trader Name')}
            placeholder="e.g. Belagavi Egg Traders"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Peti Count (210 eggs/peti)')}
              type="number"
              placeholder="e.g. 50"
              value={petis}
              onChange={(e) => setPetis(e.target.value)}
              required
            />
            <Input
              label={t('Rate (₹ / Peti)')}
              type="number"
              placeholder="e.g. 950"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>

          {/* Quick summary preview */}
          {petis && rate && (
            <div className="p-3 bg-surface-bg border border-surface-line rounded-btn text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-3">Total Eggs:</span>
                <span className="font-bold font-mono text-ink">{nf(Number(petis) * 210)} eggs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-3">Total Sale Value:</span>
                <span className="font-bold font-mono text-brand-800 text-sm">{inr(Number(petis) * Number(rate))}</span>
              </div>
            </div>
          )}

          <Input
            label={t('Amount Received Now (₹)')}
            type="number"
            placeholder="Leave empty or enter partial payment"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            hint="Remaining amount will post to Unpaid"
          />

          <Input
            label={t('Sale Date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Confirm Sale')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
