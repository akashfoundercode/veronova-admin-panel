import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ROLE_LABELS, ROLE_BADGE_TONES } from '../../constants/roles';
import { Shield, RotateCcw, User, CheckCircle2 } from 'lucide-react';

export const PilotAccounts = () => {
  const { allUsers } = useFarm();
  const { resetAllData } = useAuth();

  const handleReset = () => {
    if (window.confirm('WARNING: This will wipe all local changes and reset to the clean pilot baseline. Continue?')) {
      resetAllData();
      alert('Demo data has been reset to baseline.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Pilot Accounts & Access Governance</h2>
          <p className="text-xs text-ink-3">
            Manage pilot users, roles, and system test credentials
          </p>
        </div>
        <Button onClick={handleReset} variant="danger" size="sm" className="gap-1.5 self-start">
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Seed Data</span>
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-bg border-b border-surface-line text-ink-3 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">User Identity</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Login Identifier</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-line">
            {allUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surface-bg/50 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-800 font-bold flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-ink block">{u.name}</span>
                      {u.council && <span className="text-[10px] text-ink-4">{u.council}</span>}
                    </div>
                  </div>
                </td>
                <td className="p-3.5">
                  <Badge tone={ROLE_BADGE_TONES[u.role] || 'neutral'}>
                    {ROLE_LABELS[u.role] || u.role}
                  </Badge>
                </td>
                <td className="p-3.5 font-mono text-ink font-semibold">
                  {u.email}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-ok">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Pilot
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
