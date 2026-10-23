export const ROLE_NAVIGATION = {
  INTEG: [
    { id: 'today', label: 'Today', icon: 'Calendar', path: '/farmer/today' },
    { id: 'reports', label: 'Sick birds', icon: 'AlertCircle', path: '/farmer/reports' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/farmer/tasks' },
    { id: 'sheds', label: 'Sheds & birds', icon: 'Home', path: '/farmer/sheds' },
    { id: 'daily', label: 'Daily records', icon: 'FileText', path: '/farmer/daily' },
    { id: 'loads', label: 'Maize at the gate', icon: 'Truck', path: '/farmer/loads' },
    { id: 'health', label: 'Health', icon: 'HeartPulse', path: '/farmer/health' },
    { id: 'sales', label: 'Eggs & sales', icon: 'Egg', path: '/farmer/sales' },
    { id: 'ledger', label: 'Ledger', icon: 'BookOpen', path: '/farmer/ledger' },
    { id: 'workers', label: 'Workers & logins', icon: 'Users', path: '/farmer/workers' },
    { id: 'vet', label: 'My vet', icon: 'Stethoscope', path: '/farmer/vet' },
    { id: 'settings', label: 'Farm settings', icon: 'Settings', path: '/farmer/settings' },
  ],
  LAYER: [
    { id: 'today', label: 'Today', icon: 'Calendar', path: '/farmer/today' },
    { id: 'reports', label: 'Sick birds', icon: 'AlertCircle', path: '/farmer/reports' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/farmer/tasks' },
    { id: 'sheds', label: 'Sheds & birds', icon: 'Home', path: '/farmer/sheds' },
    { id: 'daily', label: 'Daily records', icon: 'FileText', path: '/farmer/daily' },
    { id: 'deliveries', label: 'Feed deliveries', icon: 'Package', path: '/farmer/deliveries' },
    { id: 'health', label: 'Health', icon: 'HeartPulse', path: '/farmer/health' },
    { id: 'sales', label: 'Eggs & sales', icon: 'Egg', path: '/farmer/sales' },
    { id: 'ledger', label: 'Ledger', icon: 'BookOpen', path: '/farmer/ledger' },
    { id: 'workers', label: 'Workers & logins', icon: 'Users', path: '/farmer/workers' },
    { id: 'vet', label: 'My vet', icon: 'Stethoscope', path: '/farmer/vet' },
    { id: 'settings', label: 'Farm settings', icon: 'Settings', path: '/farmer/settings' },
  ],
  VET: [
    { id: 'vreports', label: 'Sick-bird reports', icon: 'AlertCircle', path: '/vet/reports' },
    { id: 'vfarms', label: 'Farms linked to me', icon: 'Home', path: '/vet/farms' },
    { id: 'profile', label: 'My practice', icon: 'UserCheck', path: '/vet/profile' },
  ],
  MILL: [
    { id: 'profile', label: 'Mill profile', icon: 'Factory', path: '/supplier/mill' },
  ],
  MEDS: [
    { id: 'profile', label: 'Company profile', icon: 'Building2', path: '/supplier/medicine' },
  ],
  ADMIN: [
    { id: 'users', label: 'Pilot accounts', icon: 'Shield', path: '/admin/accounts' },
  ],
  WORKER: [
    { id: 'wtasks', label: 'My tasks', icon: 'CheckSquare', path: '/worker/tasks' },
    { id: 'wdaily', label: 'Daily entry', icon: 'Edit3', path: '/worker/daily' },
    { id: 'wreport', label: 'Report a problem', icon: 'AlertTriangle', path: '/worker/report' },
  ],
};

// Bottom bar tabs for Farmers on mobile
export const FARMER_MOBILE_TABS = [
  { id: 'today', label: 'Today', icon: 'Calendar', path: '/farmer/today' },
  { id: 'reports', label: 'Sick birds', icon: 'AlertCircle', path: '/farmer/reports' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/farmer/tasks' },
  { id: 'more', label: 'More', icon: 'Menu', path: '/farmer/more' },
];

// Bottom bar tabs for Workers on mobile
export const WORKER_MOBILE_TABS = [
  { id: 'wtasks', label: 'My tasks', icon: 'CheckSquare', path: '/worker/tasks' },
  { id: 'wdaily', label: 'Daily entry', icon: 'Edit3', path: '/worker/daily' },
  { id: 'wreport', label: 'Report issue', icon: 'AlertTriangle', path: '/worker/report' },
];
