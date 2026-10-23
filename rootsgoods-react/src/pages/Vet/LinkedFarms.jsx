import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Home, Phone, MapPin, Users } from 'lucide-react';

export const LinkedFarms = () => {
  const { allFarms } = useFarm();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">{t('Farms Linked to My Practice')}</h2>
        <p className="text-xs text-ink-3">
          {allFarms.length} {t('registered farms under your clinical supervision')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allFarms.map((farm) => (
          <Card key={farm.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-surface-line pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-ink">{farm.name}</h3>
                <span className="text-[10px] font-mono font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  ID: {farm.code}
                </span>
              </div>
              <Badge tone={farm.kind === 'INTEG' ? 'ok' : 'blue'}>
                {farm.kind === 'INTEG' ? 'Integrated' : 'Layer'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-ink-2">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-ink-4 flex-shrink-0" />
                <span>Owner: <b className="text-ink">{farm.owner}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-ink-4 flex-shrink-0" />
                <span>{farm.village}, {farm.district}, {farm.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ink-4 flex-shrink-0" />
                <span>{farm.phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-line flex justify-end">
              <a
                href={`tel:${farm.phone.replace(/\s+/g, '')}`}
                className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Farm</span>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
