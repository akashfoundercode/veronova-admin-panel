import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { useTranslation } from '../../context/LanguageContext';
import { Card } from '../../components/common/Card';
import { CheckCircle2, Clock } from 'lucide-react';

export const WorkerTasks = () => {
  const { currentUser, activeShed } = useAuth();
  const { tasks, toggleTask } = useFarm();
  const { t } = useTranslation();

  // Filter tasks assigned to worker or shed or all
  const workerTasks = tasks.filter(t => {
    if (t.worker_id && t.worker_id === currentUser?.workerId) return true;
    if (t.shed_id && activeShed && t.shed_id === activeShed.id) return true;
    return !t.worker_id && !t.shed_id; // general farm tasks
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-ink">{t('My Assigned Tasks')}</h2>
        <p className="text-xs text-ink-3">
          {activeShed ? activeShed.name : 'General Farm Chores'} · Tap to mark complete
        </p>
      </div>

      <div className="space-y-2.5">
        {workerTasks.length === 0 ? (
          <Card className="p-8 text-center text-xs text-ink-3">
            No pending tasks assigned right now. Good job!
          </Card>
        ) : (
          workerTasks.map((task) => (
            <Card
              key={task.id}
              onClick={() => toggleTask(task.id, currentUser?.name)}
              className={`p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-all ${
                task.done ? 'bg-surface-bg/60 border-surface-line' : 'hover:border-brand-500'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 transition-colors ${
                    task.done ? 'bg-brand-800 border-brand-800 text-white' : 'border-surface-line bg-white'
                  }`}
                >
                  {task.done && <CheckCircle2 className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <span className={`text-sm font-bold block leading-tight ${task.done ? 'line-through text-ink-4' : 'text-ink'}`}>
                    {task.title}
                  </span>
                  {task.done_at && (
                    <span className="text-[11px] text-status-ok font-mono flex items-center gap-1 mt-1 font-semibold">
                      <Clock className="w-3 h-3" />
                      Completed at {task.done_at}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
