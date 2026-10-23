import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/Input';
import { DEFAULT_TASKS } from '../../constants/poultry';
import { CheckCircle2, Plus, Clock, User, Home } from 'lucide-react';

export const Tasks = () => {
  const { tasks, workers, sheds, toggleTask, addTask } = useFarm();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // all, pending, done
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [shedId, setShedId] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    addTask(title, workerId || null, shedId || null);
    setTitle('');
    setWorkerId('');
    setShedId('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-ink">{t('Operational Tasks')}</h2>
          <p className="text-xs text-ink-3">
            {tasks.filter(t => t.done).length} / {tasks.length} {t('completed today')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>{t('Add Task')}</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-surface-bg border border-surface-line rounded-btn text-xs font-semibold">
        {['all', 'pending', 'done'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`flex-1 py-1.5 rounded text-center capitalize transition-colors ${
              filter === k ? 'bg-white text-brand-800 shadow-xs font-bold' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {t(k)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const worker = workers.find(w => w.id === task.worker_id);
          const shed = sheds.find(s => s.id === task.shed_id);
          return (
            <Card
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="p-3.5 flex items-center justify-between gap-3 hover:border-brand-500 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 flex-shrink-0 transition-colors ${
                    task.done ? 'bg-brand-800 border-brand-800 text-white' : 'border-surface-line bg-white'
                  }`}
                >
                  {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>

                <div className="min-w-0">
                  <span className={`text-xs font-semibold block leading-tight ${task.done ? 'line-through text-ink-4' : 'text-ink'}`}>
                    {task.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-ink-3">
                    {shed && (
                      <span className="flex items-center gap-1 font-medium">
                        <Home className="w-3 h-3 text-ink-4" />
                        {shed.name}
                      </span>
                    )}
                    {worker && (
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3 h-3 text-ink-4" />
                        {worker.name}
                      </span>
                    )}
                    {task.done_at && (
                      <span className="flex items-center gap-1 font-mono text-status-ok font-semibold">
                        <Clock className="w-3 h-3" />
                        Done at {task.done_at}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Badge tone={task.done ? 'ok' : 'neutral'}>
                {task.done ? t('Done') : t('Pending')}
              </Badge>
            </Card>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Assign New Task')}
        subtitle={t('Select preset task or write custom instruction')}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quick preset buttons */}
          <div>
            <label className="text-xs font-semibold text-ink-2 block mb-1">
              {t('Quick Presets')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TASKS.slice(0, 4).map((pt) => (
                <button
                  type="button"
                  key={pt}
                  onClick={() => setTitle(pt)}
                  className="px-2.5 py-1 text-xs bg-surface-bg border border-surface-line rounded-btn text-ink-2 hover:bg-brand-50 hover:border-brand-500 hover:text-brand-900 transition-colors"
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={t('Task Title')}
            placeholder="e.g. Weigh 50 birds"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label={t('Assign Worker')}
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          >
            <option value="">Any available worker</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>

          <Select
            label={t('Target Shed')}
            value={shedId}
            onChange={(e) => setShedId(e.target.value)}
          >
            <option value="">All Sheds</option>
            {sheds.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          <div className="pt-2 flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} block>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" block>
              {t('Create Task')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
