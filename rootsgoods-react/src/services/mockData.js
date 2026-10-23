import { today } from '../utils/formatters';

export const INITIAL_MOCK_DATA = {
  users: [
    { id: 1, email: 'farmer01', role: 'INTEG', name: 'Pilot farmer 01', code: 'farmer01' },
    { id: 2, email: 'layer01', role: 'LAYER', name: 'Pilot layer farmer 01', code: 'layer01' },
    { id: 3, email: 'vet01', role: 'VET', name: 'Dr. Ramesh Kulkarni', council: 'Karnataka Veterinary Council', reg_no: 'KVC-8942', phone: '+91 98450 12345' },
    { id: 4, email: 'feed01', role: 'MILL', name: 'Karnataka Feeds Ltd', contact: 'Vijay Patil', phone: '+91 94481 22334', capacity: '150 MT/day' },
    { id: 5, email: 'meds01', role: 'MEDS', name: 'PoultryMed Healthcare', contact: 'Dr. S. Nair', phone: '+91 98220 55667', license: 'DL-2024-KA-881' },
    { id: 6, email: 'admin', role: 'ADMIN', name: 'RootsGoods admin' }
  ],
  farms: [
    {
      id: 1,
      user_id: 1,
      code: 'farmer01',
      kind: 'INTEG',
      name: 'RootsGoods Pilot Farm',
      owner: 'Pilot farmer 01',
      phone: '+91 98800 11223',
      village: 'Gokak',
      district: 'Belagavi',
      state: 'Karnataka',
      supplier: 'Local maize trader',
      vet_user_id: 3,
      vet_name: 'Dr. Ramesh Kulkarni',
      vet_phone: '+91 98450 12345'
    },
    {
      id: 2,
      user_id: 2,
      code: 'layer01',
      kind: 'LAYER',
      name: 'Barwala Layer Farm',
      owner: 'Pilot layer farmer 01',
      phone: '+91 98120 33445',
      village: 'Barwala',
      district: 'Panchkula',
      state: 'Haryana',
      brand: 'Layer mash Phase II',
      dealer: 'Local feed depot',
      vet_user_id: 3,
      vet_name: 'Dr. Ramesh Kulkarni',
      vet_phone: '+91 98450 12345'
    }
  ],
  sheds: [
    { id: 1, farm_id: 1, name: 'Shed 1', breed: 'BV-300', birds: 3950, age_weeks: 34, capacity: 4000 },
    { id: 2, farm_id: 1, name: 'Shed 2', breed: 'BV-300', birds: 3920, age_weeks: 22, capacity: 4000 },
    { id: 3, farm_id: 2, name: 'Shed A', breed: 'Hy-Line W-80', birds: 3980, age_weeks: 41, capacity: 4000 },
    { id: 4, farm_id: 2, name: 'Shed B', breed: 'Hy-Line W-80', birds: 3975, age_weeks: 27, capacity: 4000 }
  ],
  workers: [
    { id: 1, farm_id: 1, name: 'Ravi', pin: '1111', sheds: [1] },
    { id: 2, farm_id: 1, name: 'Mallappa', pin: '2222', sheds: [2] },
    { id: 3, farm_id: 1, name: 'Shivu', pin: '3333', sheds: [1, 2] },
    { id: 4, farm_id: 2, name: 'Gurpreet', pin: '4444', sheds: [3] },
    { id: 5, farm_id: 2, name: 'Sonu', pin: '5555', sheds: [4] }
  ],
  tasks: [
    { id: 1, farm_id: 1, worker_id: 1, shed_id: 1, title: 'Collect eggs: Morning', done: false, date: today() },
    { id: 2, farm_id: 1, worker_id: 1, shed_id: 1, title: 'Mortality round', done: true, done_at: '08:30', date: today() },
    { id: 3, farm_id: 1, worker_id: 2, shed_id: 2, title: 'Check drinkers in every row', done: true, done_at: '09:15', date: today() },
    { id: 4, farm_id: 1, worker_id: 3, shed_id: null, title: 'Mix layer mash', done: false, date: today() }
  ],
  daily: [
    { id: 1, farm_id: 1, shed_id: 1, date: today(), eggs: 3680, deaths: 2, feed_kg: 440, by_name: 'Ravi' },
    { id: 2, farm_id: 1, shed_id: 2, date: today(), eggs: 3710, deaths: 4, feed_kg: 450, by_name: 'Mallappa' },
    { id: 3, farm_id: 1, shed_id: 1, date: '2026-10-16', eggs: 3670, deaths: 1, feed_kg: 440, by_name: 'Ravi' },
    { id: 4, farm_id: 1, shed_id: 2, date: '2026-10-16', eggs: 3695, deaths: 2, feed_kg: 450, by_name: 'Mallappa' },
    { id: 5, farm_id: 2, shed_id: 3, date: today(), eggs: 3740, deaths: 1, feed_kg: 460, by_name: 'Gurpreet' },
    { id: 6, farm_id: 2, shed_id: 4, date: today(), eggs: 3765, deaths: 2, feed_kg: 460, by_name: 'Sonu' }
  ],
  reports: [
    {
      id: 1,
      farm_id: 1,
      farm_code: 'farmer01',
      shed_id: 2,
      shed_name: 'Shed 2',
      sick: 40,
      dead: 9,
      signs: ['Gasping', 'Sneezing', 'Drop in lay'],
      note: 'Worst near the end wall fans.',
      by_name: 'Mallappa (shed phone)',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      reply_dx: 'Infectious Bronchitis suspected',
      reply_advice: 'Keep birds warm and give vitamin C & electrolytes in water. Move ND booster 14 days later.',
      replied_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      vet_name: 'Dr. Ramesh Kulkarni'
    }
  ],
  issues: [
    {
      id: 1,
      farm_id: 1,
      shed_id: 1,
      shed_name: 'Shed 1',
      category: 'water',
      note: 'Row 3 nipple drinker leaking continuously',
      urgency: 'high',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      by_name: 'Ravi'
    }
  ],
  loads: [
    {
      id: 1,
      farm_id: 1,
      supplier: 'Local maize trader',
      receipt_no: 'TR-9821',
      vehicle_no: 'KA-22-B-4412',
      bags: 120,
      net_kg: 6000,
      rate_per_kg: 22.5,
      moisture_pct: 12.8,
      status: 'Accepted',
      created_at: '2026-10-14'
    }
  ],
  deliveries: [
    {
      id: 1,
      farm_id: 2,
      brand: 'Layer mash Phase II',
      dealer: 'Local feed depot',
      kg: 6000,
      rate: 29.0,
      batch: 'FD-260918-A',
      cert_protein: 16.5,
      cert_calcium: 3.85,
      created_at: '2026-10-12'
    }
  ],
  health: [
    {
      id: 1,
      farm_id: 1,
      shed_id: 1,
      product: 'Newcastle Disease Booster',
      due_date: today(),
      dose: '1 dose per bird via drinking water',
      withdrawal_days: 0,
      given: false
    },
    {
      id: 2,
      farm_id: 1,
      shed_id: 2,
      product: 'Tylosin Tartrate',
      due_date: '2026-10-20',
      dose: '0.5g / liter water for 3 days',
      withdrawal_days: 5,
      given: false
    }
  ],
  sales: [
    {
      id: 1,
      farm_id: 1,
      buyer: 'Belagavi Egg Traders',
      peti_count: 35,
      rate_per_peti: 945,
      total_amount: 33075,
      paid_amount: 25000,
      unpaid_amount: 8075,
      date: '2026-10-15'
    }
  ],
  ledger: [
    { id: 1, farm_id: 1, date: '2026-10-15', desc: 'Egg Sale: Belagavi Egg Traders (35 Peti)', type: 'CREDIT', amount: 33075 },
    { id: 2, farm_id: 1, date: '2026-10-15', desc: 'Cash Received: Belagavi Egg Traders', type: 'DEBIT', amount: 25000 },
    { id: 3, farm_id: 1, date: '2026-10-14', desc: 'Maize Purchase: 6000 kg @ ₹22.50', type: 'DEBIT', amount: 135000 }
  ]
};
