import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStore, setStore } from '../services/storage';
import { useAuth } from './AuthContext';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(getStore);

  const refresh = () => {
    setData(getStore());
  };

  const farmId = currentUser?.farm?.id || 1;

  // Filtered operational datasets for current farm
  const currentSheds = data.sheds.filter(s => s.farm_id === farmId);
  const currentWorkers = data.workers.filter(w => w.farm_id === farmId);
  const currentTasks = data.tasks.filter(t => t.farm_id === farmId);
  const currentDaily = data.daily.filter(d => d.farm_id === farmId);
  const currentReports = data.reports.filter(r => r.farm_id === farmId);
  const currentIssues = data.issues.filter(i => i.farm_id === farmId);
  const currentLoads = data.loads.filter(l => l.farm_id === farmId);
  const currentDeliveries = data.deliveries.filter(d => d.farm_id === farmId);
  const currentHealth = data.health.filter(h => h.farm_id === farmId);
  const currentSales = data.sales.filter(s => s.farm_id === farmId);
  const currentLedger = data.ledger.filter(l => l.farm_id === farmId);

  // Operations
  const addShed = (shed) => {
    const db = getStore();
    const newShed = {
      id: Date.now(),
      farm_id: farmId,
      name: shed.name,
      breed: shed.breed,
      birds: Number(shed.birds) || 0,
      age_weeks: Number(shed.age_weeks) || 0,
      capacity: Number(shed.capacity) || 4000
    };
    db.sheds.push(newShed);
    setStore(db);
    refresh();
  };

  const toggleTask = (taskId, doneBy = 'Farmer') => {
    const db = getStore();
    const task = db.tasks.find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      task.done_at = task.done ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;
      task.done_by = task.done ? doneBy : null;
      setStore(db);
      refresh();
    }
  };

  const addTask = (title, workerId = null, shedId = null) => {
    const db = getStore();
    db.tasks.push({
      id: Date.now(),
      farm_id: farmId,
      worker_id: workerId ? Number(workerId) : null,
      shed_id: shedId ? Number(shedId) : null,
      title,
      done: false,
      date: new Date().toISOString().slice(0, 10)
    });
    setStore(db);
    refresh();
  };

  const addDailyEntry = (entry) => {
    const db = getStore();
    const newEntry = {
      id: Date.now(),
      farm_id: farmId,
      shed_id: Number(entry.shed_id),
      date: entry.date || new Date().toISOString().slice(0, 10),
      eggs: Number(entry.eggs) || 0,
      deaths: Number(entry.deaths) || 0,
      feed_kg: Number(entry.feed_kg) || 0,
      by_name: entry.by_name || currentUser?.name || 'Worker'
    };
    db.daily.unshift(newEntry);
    
    // Decrement birds count in shed
    const shed = db.sheds.find(s => s.id === Number(entry.shed_id));
    if (shed && newEntry.deaths > 0) {
      shed.birds = Math.max(0, shed.birds - newEntry.deaths);
    }
    
    setStore(db);
    refresh();
  };

  const addReport = (report) => {
    const db = getStore();
    const shed = db.sheds.find(s => s.id === Number(report.shed_id));
    const newReport = {
      id: Date.now(),
      farm_id: farmId,
      farm_code: currentUser?.farm?.code || 'farmer01',
      shed_id: Number(report.shed_id),
      shed_name: shed ? shed.name : 'All sheds',
      sick: Number(report.sick) || 0,
      dead: Number(report.dead) || 0,
      signs: report.signs || [],
      note: report.note || '',
      by_name: currentUser?.name || 'Farmer',
      created_at: new Date().toISOString(),
      reply_dx: null,
      reply_advice: null,
      replied_at: null,
      vet_name: currentUser?.farm?.vet_name || 'Dr. Ramesh Kulkarni'
    };
    db.reports.unshift(newReport);
    setStore(db);
    refresh();
  };

  const replyReport = (reportId, reply_dx, reply_advice) => {
    const db = getStore();
    const r = db.reports.find(x => x.id === reportId);
    if (r) {
      r.reply_dx = reply_dx;
      r.reply_advice = reply_advice;
      r.replied_at = new Date().toISOString();
      r.vet_name = currentUser?.name || 'Dr. Ramesh Kulkarni';
      setStore(db);
      refresh();
    }
  };

  const addIssue = (issue) => {
    const db = getStore();
    const shed = db.sheds.find(s => s.id === Number(issue.shed_id));
    db.issues.unshift({
      id: Date.now(),
      farm_id: farmId,
      shed_id: Number(issue.shed_id),
      shed_name: shed ? shed.name : 'General',
      category: issue.category,
      note: issue.note,
      urgency: issue.urgency || 'normal',
      created_at: new Date().toISOString(),
      by_name: currentUser?.name || 'Worker'
    });
    setStore(db);
    refresh();
  };

  const addMaizeLoad = (load) => {
    const db = getStore();
    db.loads.unshift({
      id: Date.now(),
      farm_id: farmId,
      supplier: load.supplier,
      receipt_no: load.receipt_no || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle_no: load.vehicle_no,
      bags: Number(load.bags) || 0,
      net_kg: Number(load.net_kg) || (Number(load.bags) * 50),
      rate_per_kg: Number(load.rate_per_kg) || 0,
      moisture_pct: Number(load.moisture_pct) || 12.5,
      status: 'Accepted',
      created_at: new Date().toISOString().slice(0, 10)
    });
    setStore(db);
    refresh();
  };

  const addFeedDelivery = (del) => {
    const db = getStore();
    db.deliveries.unshift({
      id: Date.now(),
      farm_id: farmId,
      brand: del.brand,
      dealer: del.dealer,
      kg: Number(del.kg) || 0,
      rate: Number(del.rate) || 0,
      batch: del.batch || `FD-${Math.floor(100000 + Math.random() * 900000)}`,
      cert_protein: Number(del.cert_protein) || 16.5,
      cert_calcium: Number(del.cert_calcium) || 3.8,
      created_at: new Date().toISOString().slice(0, 10)
    });
    setStore(db);
    refresh();
  };

  const addHealthItem = (item) => {
    const db = getStore();
    db.health.push({
      id: Date.now(),
      farm_id: farmId,
      shed_id: item.shed_id ? Number(item.shed_id) : null,
      product: item.product,
      due_date: item.due_date,
      dose: item.dose,
      withdrawal_days: Number(item.withdrawal_days) || 0,
      given: false
    });
    setStore(db);
    refresh();
  };

  const toggleHealthGiven = (id) => {
    const db = getStore();
    const h = db.health.find(x => x.id === id);
    if (h) {
      h.given = !h.given;
      setStore(db);
      refresh();
    }
  };

  const addEggSale = (sale) => {
    const db = getStore();
    const petis = Number(sale.peti_count) || 0;
    const rate = Number(sale.rate_per_peti) || 0;
    const total = petis * rate;
    const paid = Number(sale.paid_amount) || 0;
    const unpaid = Math.max(0, total - paid);

    db.sales.unshift({
      id: Date.now(),
      farm_id: farmId,
      buyer: sale.buyer,
      peti_count: petis,
      rate_per_peti: rate,
      total_amount: total,
      paid_amount: paid,
      unpaid_amount: unpaid,
      date: sale.date || new Date().toISOString().slice(0, 10)
    });

    // Add corresponding ledger credit
    db.ledger.unshift({
      id: Date.now(),
      farm_id: farmId,
      date: sale.date || new Date().toISOString().slice(0, 10),
      desc: `Egg Sale: ${sale.buyer} (${petis} Peti)`,
      type: 'CREDIT',
      amount: total
    });

    setStore(db);
    refresh();
  };

  const addWorker = (worker) => {
    const db = getStore();
    db.workers.push({
      id: Date.now(),
      farm_id: farmId,
      name: worker.name,
      pin: worker.pin,
      sheds: (worker.sheds || []).map(Number)
    });
    setStore(db);
    refresh();
  };

  return (
    <FarmContext.Provider
      value={{
        sheds: currentSheds,
        workers: currentWorkers,
        tasks: currentTasks,
        daily: currentDaily,
        reports: currentReports,
        issues: currentIssues,
        loads: currentLoads,
        deliveries: currentDeliveries,
        health: currentHealth,
        sales: currentSales,
        ledger: currentLedger,
        allReports: data.reports, // for Vet view
        allFarms: data.farms,     // for Vet view
        allUsers: data.users,     // for Admin view
        addShed,
        addTask,
        toggleTask,
        addDailyEntry,
        addReport,
        replyReport,
        addIssue,
        addMaizeLoad,
        addFeedDelivery,
        addHealthItem,
        toggleHealthGiven,
        addEggSale,
        addWorker,
        refresh
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
