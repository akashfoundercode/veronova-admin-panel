import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { fmtDate, inr, nf } from '../../utils/formatters';
import { Package, Plus } from 'lucide-react';

export const FeedDeliveries = () => {
  const { deliveries, addFeedDelivery } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [brand, setBrand] = useState('Layer mash Phase II');
  const [dealer, setDealer] = useState('');
  const [kg, setKg] = useState('');
  const [rate, setRate] = useState('29.0');
  const [batch, setBatch] = useState('');
  const [protein, setProtein] = useState('16.5');
  const [calcium, setCalcium] = useState('3.8');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dealer || !kg) return;
    addFeedDelivery({
      brand,
      dealer,
      kg: Number(kg),
      rate: Number(rate) || 0,
      batch,
      cert_protein: Number(protein) || 16.5,
      cert_calcium: Number(calcium) || 3.8,
    });
    setDealer('');
    setKg('');
    setBatch('');
    setModalOpen(false);
  };

  const totalKg = deliveries.reduce((sum, d) => sum + (d.kg || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Feed Deliveries')}</h2>
          <p className="text-xs text-ink-3">
            {deliveries.length} {t('deliveries')} · {nf(totalKg)} kg {t('received')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Record Feed')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {deliveries.map((del) => {
          const totalVal = (del.kg || 0) * (del.rate || 0);
          return (
            <Card key={del.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-surface-line pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-brand-50 text-brand-800 flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ink">{del.brand}</h3>
                    <span className="text-[10px] text-ink-3">Dealer: {del.dealer} · Batch {del.batch}</span>
                  </div>
                </div>
                <Badge tone="ok">{fmtDate(del.created_at)}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Quantity')}</span>
                  <span className="font-bold font-mono text-ink">{nf(del.kg)} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Rate / kg')}</span>
                  <span className="font-bold font-mono text-ink">₹{del.rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Lab Spec')}</span>
                  <span className="font-mono text-ink font-semibold">
                    {del.cert_protein}% CP · {del.cert_calcium}% Ca
                  </span>
                </div>
              </div>

              {totalVal > 0 && (
                <div className="pt-2 border-t border-surface-line flex justify-between text-xs">
                  <span className="text-ink-3">{t('Total Amount')}:</span>
                  <span className="font-bold font-mono text-brand-900">{inr(totalVal)}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Record Feed Delivery Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Record Feed Delivery')}
        subtitle={t('Enter supplier batch and nutritional specs')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Feed Brand / Formula')}
            placeholder="e.g. Layer mash Phase II"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />

          <Input
            label={t('Dealer / Depot Name')}
            placeholder="e.g. Local feed depot"
            value={dealer}
            onChange={(e) => setDealer(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Quantity (kg)')}
              type="number"
              placeholder="e.g. 5000"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              required
            />
            <Input
              label={t('Rate (₹ / kg)')}
              type="number"
              step="0.01"
              placeholder="e.g. 29.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>

          <Input
            label={t('Batch / Invoice Number')}
            placeholder="e.g. FD-260918-B"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Crude Protein %')}
              type="number"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <Input
              label={t('Calcium %')}
              type="number"
              step="0.01"
              value={calcium}
              onChange={(e) => setCalcium(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Post Delivery')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
