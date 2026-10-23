import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { STATES } from '../../constants/poultry';
import { Settings, Save } from 'lucide-react';

export const FarmSettings = () => {
  const { currentUser } = useAuth();
  const { lang, setLang, t, supportedLanguages } = useTranslation();

  const [farmName, setFarmName] = useState(currentUser?.farm?.name || 'RootsGoods Farm');
  const [owner, setOwner] = useState(currentUser?.farm?.owner || 'Pilot Farmer');
  const [phone, setPhone] = useState(currentUser?.farm?.phone || '+91 98800 11223');
  const [village, setVillage] = useState(currentUser?.farm?.village || 'Gokak');
  const [district, setDistrict] = useState(currentUser?.farm?.district || 'Belagavi');
  const [state, setState] = useState(currentUser?.farm?.state || 'Karnataka');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('Farm Settings')}</h2>
        <p className="text-xs text-ink-3">
          {t('Manage farm profile, location, and regional language defaults')}
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="bg-surface-bg p-3 rounded-btn border border-surface-line flex items-center justify-between">
            <span className="text-xs text-ink-3 font-semibold">Farm Identifier Code:</span>
            <span className="font-mono font-bold text-sm text-brand-900 bg-white px-2 py-0.5 rounded border border-surface-line">
              {currentUser?.farm?.code || 'farmer01'}
            </span>
          </div>

          <Input
            label={t('Farm Legal Name')}
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            required
          />

          <Input
            label={t('Owner / Licensee Name')}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            required
          />

          <Input
            label={t('Registered Phone Number')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('Village / Town')}
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              required
            />
            <Input
              label={t('District')}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
          </div>

          <Select
            label={t('State')}
            value={state}
            onChange={(e) => setState(e.target.value)}
            options={STATES}
            required
          />

          <Select
            label={t('System Language')}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </Select>

          <div className="pt-2">
            <Button variant="primary" type="submit" block className="gap-2">
              <Save className="w-4 h-4" />
              <span>{saved ? t('Saved Successfully!') : t('Update Settings')}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
