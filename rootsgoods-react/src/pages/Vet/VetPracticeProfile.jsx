import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { VET_COUNCILS, STATES } from '../../constants/poultry';
import { Stethoscope, Save } from 'lucide-react';

export const VetPracticeProfile = () => {
  const [name, setName] = useState('Dr. Ramesh Kulkarni');
  const [qual, setQual] = useState('B.V.Sc & A.H, M.V.Sc (Poultry Science)');
  const [council, setCouncil] = useState('Karnataka Veterinary Council');
  const [regNo, setRegNo] = useState('KVC-8942');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [clinic, setClinic] = useState('Kulkarni Avian Clinic & Pathology Lab, Belagavi');
  const [state, setState] = useState('Karnataka');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-ink">Veterinary Practice Profile</h2>
        <p className="text-xs text-ink-3">
          Manage your official medical qualifications, council registration, and clinical service details
        </p>
      </div>

      <Card className="p-5 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Doctor Name (with Title)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Qualifications & Degrees"
            value={qual}
            onChange={(e) => setQual(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="State Veterinary Council"
              value={council}
              onChange={(e) => setCouncil(e.target.value)}
              options={VET_COUNCILS}
              required
            />
            <Input
              label="Registration Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Direct Mobile / Emergency Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Select
              label="Operating State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={STATES}
              required
            />
          </div>

          <Input
            label="Clinic / Laboratory Address"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button variant="primary" type="submit" block className="gap-2">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Profile Updated!' : 'Save Practice Profile'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
