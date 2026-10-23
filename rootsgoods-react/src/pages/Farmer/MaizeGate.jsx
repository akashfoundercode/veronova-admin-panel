import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { fmtDate, inr, nf } from '../../utils/formatters';
import { Truck, Plus, CheckCircle2 } from 'lucide-react';

export const MaizeGate = () => {
  const { loads, addMaizeLoad } = useFarm();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const [supplier, setSupplier] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [bags, setBags] = useState('');
  const [netKg, setNetKg] = useState('');
  const [rate, setRate] = useState('');
  const [moisture, setMoisture] = useState('12.5');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier || !vehicleNo || !bags) return;
    addMaizeLoad({
      supplier,
      vehicle_no: vehicleNo,
      receipt_no: receiptNo,
      bags: Number(bags),
      net_kg: Number(netKg) || (Number(bags) * 50),
      rate_per_kg: Number(rate) || 0,
      moisture_pct: Number(moisture) || 12.5,
    });
    setSupplier('');
    setVehicleNo('');
    setReceiptNo('');
    setBags('');
    setNetKg('');
    setRate('');
    setModalOpen(false);
  };

  const totalKg = loads.reduce((sum, l) => sum + (l.net_kg || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Maize at the Gate')}</h2>
          <p className="text-xs text-ink-3">
            {loads.length} {t('loads')} · {nf(totalKg)} kg {t('received')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Record Arrival')}</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {loads.map((load) => {
          const totalVal = (load.net_kg || 0) * (load.rate_per_kg || 0);
          return (
            <Card key={load.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-surface-line pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-brand-50 text-brand-800 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-ink">{load.supplier}</h3>
                    <span className="text-[10px] text-ink-3 font-mono">{load.vehicle_no} · Rec #{load.receipt_no}</span>
                  </div>
                </div>
                <Badge tone="ok">{load.status || 'Accepted'}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Quantity')}</span>
                  <span className="font-bold font-mono text-ink">{nf(load.net_kg)} kg</span>
                  <span className="text-[10px] text-ink-3 block">({load.bags} bags)</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Rate / kg')}</span>
                  <span className="font-bold font-mono text-ink">₹{load.rate_per_kg}</span>
                </div>
                <div>
                  <span className="text-[10px] text-ink-4 block">{t('Moisture')}</span>
                  <span className={`font-bold font-mono ${load.moisture_pct > 14 ? 'text-status-warn' : 'text-status-ok'}`}>
                    {load.moisture_pct}%
                  </span>
                </div>
              </div>

              {totalVal > 0 && (
                <div className="pt-2 border-t border-surface-line flex justify-between text-xs">
                  <span className="text-ink-3">{t('Total Cost')}:</span>
                  <span className="font-bold font-mono text-brand-900">{inr(totalVal)}</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Record Maize Arrival Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Record Maize Arrival')}
        subtitle={t('Enter supplier, truck scale weight, and quality parameters')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label={t('Supplier / Trader')}
            placeholder="e.g. Mahaveer Grain Agency"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Vehicle Number')}
              placeholder="e.g. KA-22-B-9912"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              required
            />
            <Input
              label={t('Receipt / Gate Pass #')}
              placeholder="e.g. TR-4421"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Bags Count')}
              type="number"
              placeholder="e.g. 100"
              value={bags}
              onChange={(e) => {
                setBags(e.target.value);
                if (!netKg) setNetKg(String(Number(e.target.value) * 50));
              }}
              required
            />
            <Input
              label={t('Net Weight (kg)')}
              type="number"
              placeholder="e.g. 5000"
              value={netKg}
              onChange={(e) => setNetKg(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Rate (₹ / kg)')}
              type="number"
              step="0.01"
              placeholder="e.g. 22.50"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
            <Input
              label={t('Moisture %')}
              type="number"
              step="0.1"
              placeholder="e.g. 12.5"
              value={moisture}
              onChange={(e) => setMoisture(e.target.value)}
              hint="Max 14% recommended"
              required
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Accept Load')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
