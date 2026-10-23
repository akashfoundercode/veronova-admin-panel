import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { STATES } from '../../constants/poultry';
import { Building2, Save } from 'lucide-react';

export const MedicineProfile = () => {
  const [company, setCompany] = useState('PoultryMed Healthcare Pvt Ltd');
  const [license, setLicense] = useState('DL-2024-KA-881 (Form 20B/21B)');
  const [contact, setContact] = useState('Dr. S. Nair');
  const [phone, setPhone] = useState('+91 98220 55667');
  const [address, setAddress] = useState('78 Pharma Park, Peenya, Bengaluru');
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
        <h2 className="text-lg font-bold text-ink">Medicine Supplier Profile</h2>
        <p className="text-xs text-ink-3">
          Manage your pharma licensing credentials, operating territories, and contact information
        </p>
      </div>

      <Card className="p-5 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Pharmaceutical Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />

          <Input
            label="Wholesale Drug License Number"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Authorized Representative"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Primary State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={STATES}
              required
            />
            <Input
              label="Registered Facility Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" block className="gap-2">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Company Profile Saved!' : 'Save Company Details'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
