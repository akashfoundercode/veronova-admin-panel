import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { Alert } from '../../components/common/Alert';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { fmtDate, nf } from '../../utils/formatters';
import { AlertTriangle, Plus, Egg, Skull, Utensils, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TodayOverview = () => {
  const { currentUser } = useAuth();
  const { sheds, daily, tasks, health, reports, issues, addDailyEntry, toggleTask } = useFarm();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [selectedShedId, setSelectedShedId] = useState(sheds[0]?.id || '');
  const [eggs, setEggs] = useState('');
  const [deaths, setDeaths] = useState('');
  const [feed, setFeed] = useState('');

  // Calculations for Today
  const todayDate = new Date().toISOString().slice(0, 10);
  const todaysEntries = daily.filter(d => d.date === todayDate);
  const totalEggsToday = todaysEntries.reduce((sum, d) => sum + (d.eggs || 0), 0);
  const totalDeathsToday = todaysEntries.reduce((sum, d) => sum + (d.deaths || 0), 0);
  const totalFeedToday = todaysEntries.reduce((sum, d) => sum + (d.feed_kg || 0), 0);
  const totalLiveBirds = sheds.reduce((sum, s) => sum + (s.birds || 0), 0);

  const layRate = totalLiveBirds > 0 ? ((totalEggsToday / totalLiveBirds) * 100).toFixed(1) : 0;

  // Alerts needing attention
  const pendingTasks = tasks.filter(t => !t.done);
  const dueVaccines = health.filter(h => !h.given && h.due_date <= todayDate);
  const openReports = reports.filter(r => !r.reply_dx);

  const handleSaveDaily = (e) => {
    e.preventDefault();
    if (!selectedShedId) return;
    addDailyEntry({
      shed_id: selectedShedId,
      eggs: Number(eggs) || 0,
      deaths: Number(deaths) || 0,
      feed_kg: Number(feed) || 0,
    });
    setEggs('');
    setDeaths('');
    setFeed('');
    setDailyModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Overview Top Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          label={t('Eggs Today')}
          value={nf(totalEggsToday)}
          sub={`${layRate}% ${t('lay rate')}`}
          tone="ok"
        />
        <StatCard
          label={t('Mortality')}
          value={nf(totalDeathsToday)}
          sub={`${totalLiveBirds.toLocaleString()} ${t('birds')}`}
          tone={totalDeathsToday > 5 ? 'danger' : 'neutral'}
        />
        <StatCard
          label={t('Feed Given')}
          value={`${nf(totalFeedToday)} kg`}
          sub={t('Daily mix')}
        />
      </div>

      {/* Action Bar */}
      <div className="flex gap-2">
        <Button
          onClick={() => setDailyModalOpen(true)}
          variant="primary"
          size="md"
          block
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Record Daily Entry')}</span>
        </Button>
        <Button
          onClick={() => navigate('/farmer/reports')}
          variant="secondary"
          size="md"
          className="px-3"
          title="Report sick birds"
        >
          <AlertTriangle className="w-4 h-4 text-status-warn" />
        </Button>
      </div>

      {/* Actionable Alerts Section */}
      <div className="space-y-2">
        {openReports.length > 0 && (
          <Alert
            tone="warn"
            title={`${openReports.length} ${t('Sick-bird report waiting for vet')}`}
            description={openReports[0].signs.join(', ')}
            action={
              <Button size="sm" variant="secondary" onClick={() => navigate('/farmer/reports')}>
                {t('View')}
              </Button>
            }
          />
        )}

        {dueVaccines.length > 0 && (
          <Alert
            tone="danger"
            title={`${dueVaccines[0].product} ${t('due today')}`}
            description={dueVaccines[0].dose}
            action={
              <Button size="sm" variant="secondary" onClick={() => navigate('/farmer/health')}>
                {t('Schedule')}
              </Button>
            }
          />
        )}

        {issues.length > 0 && (
          <Alert
            tone="neutral"
            title={`${t('Shed Issue')}: ${issues[0].category.toUpperCase()}`}
            description={issues[0].note}
          />
        )}
      </div>

      {/* Sheds Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{t('Sheds & Flocks')}</h3>
          <button
            onClick={() => navigate('/farmer/sheds')}
            className="text-xs text-brand-800 font-bold hover:underline flex items-center"
          >
            <span>{t('Manage')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {sheds.map((shed) => {
            const shedDaily = todaysEntries.find(d => d.shed_id === shed.id);
            return (
              <Card key={shed.id} className="p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{shed.name}</span>
                    <Badge tone="brand">{shed.breed}</Badge>
                  </div>
                  <span className="text-xs font-mono font-bold text-ink">
                    {nf(shed.birds)} <span className="text-ink-4 text-[11px]">/ {shed.capacity}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-line text-xs">
                  <div>
                    <span className="text-ink-4 block text-[10px]">{t('Age')}</span>
                    <span className="font-semibold text-ink">{shed.age_weeks} weeks</span>
                  </div>
                  <div>
                    <span className="text-ink-4 block text-[10px]">{t('Eggs Today')}</span>
                    <span className="font-semibold text-brand-800">{shedDaily ? nf(shedDaily.eggs) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-ink-4 block text-[10px]">{t('Mortality')}</span>
                    <span className={`font-semibold ${shedDaily?.deaths > 2 ? 'text-status-danger' : 'text-ink'}`}>
                      {shedDaily ? shedDaily.deaths : '—'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Tasks Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{t('Today’s Tasks')}</h3>
          <button
            onClick={() => navigate('/farmer/tasks')}
            className="text-xs text-brand-800 font-bold hover:underline flex items-center"
          >
            <span>{t('All')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <Card className="divide-y divide-surface-line">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="p-3 flex items-center justify-between gap-3 hover:bg-surface-bg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    task.done ? 'bg-brand-800 border-brand-800 text-white' : 'border-surface-line bg-white'
                  }`}
                >
                  {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs font-medium truncate ${task.done ? 'line-through text-ink-4' : 'text-ink'}`}>
                  {task.title}
                </span>
              </div>
              {task.done_at && <span className="text-[10px] text-ink-4 font-mono">{task.done_at}</span>}
            </div>
          ))}
        </Card>
      </div>

      {/* Record Daily Entry Modal */}
      <Modal
        isOpen={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        title={t('Record Daily Entry')}
        subtitle={t('Enter eggs collected, mortality, and feed kg')}
      >
        <form onSubmit={handleSaveDaily} className="space-y-3.5">
          <Select
            label={t('Select Shed')}
            value={selectedShedId}
            onChange={(e) => setSelectedShedId(e.target.value)}
            required
          >
            {sheds.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.birds} birds)
              </option>
            ))}
          </Select>

          <Input
            label={t('Eggs Collected')}
            type="number"
            placeholder="e.g. 3650"
            value={eggs}
            onChange={(e) => setEggs(e.target.value)}
            required
          />

          <Input
            label={t('Mortality (Dead birds)')}
            type="number"
            placeholder="e.g. 2"
            value={deaths}
            onChange={(e) => setDeaths(e.target.value)}
            required
          />

          <Input
            label={t('Feed Given (kg)')}
            type="number"
            placeholder="e.g. 450"
            value={feed}
            onChange={(e) => setFeed(e.target.value)}
            required
          />

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setDailyModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Save Entry')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
