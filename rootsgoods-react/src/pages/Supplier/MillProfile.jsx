import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { STATES } from '../../constants/poultry';
import { Factory, Save } from 'lucide-react';

export const MillProfile = () => {
  const [millName, setMillName] = useState('Karnataka Feeds & Agro Industries');
  const [contact, setContact] = useState('Vijay Patil (Plant Manager)');
  const [phone, setPhone] = useState('+91 94481 22334');
  const [capacity, setCapacity] = useState('150 MT / day');
  const [address, setAddress] = useState('Plot 44, Industrial Area, Hubballi');
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
        <h2 className="text-lg font-bold text-ink">Feed Mill Profile</h2>
        <p className="text-xs text-ink-3">
          Manage your feed processing capacity, registered depot, and contact details
        </p>
      </div>

      <Card className="p-5 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Feed Mill Business Name"
            value={millName}
            onChange={(e) => setMillName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Person & Title"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Milling Capacity (MT/day)"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
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
            label="Mill Address / Depot Location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button variant="primary" type="submit" block className="gap-2">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Mill Details Updated!' : 'Update Mill Profile'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
