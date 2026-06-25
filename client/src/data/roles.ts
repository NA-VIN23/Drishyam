export type RoleKey = 'ADMIN' | 'MANAGER' | 'ENGINEER' | 'TECHNICIAN' | 'OPERATIONS';

export type RoleOption = {
  key: RoleKey;
  label: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  { key: 'ADMIN', label: 'Administrator' },
  { key: 'MANAGER', label: 'Manager' },
  { key: 'ENGINEER', label: 'Engineer' },
  { key: 'TECHNICIAN', label: 'Technician' },
  { key: 'OPERATIONS', label: 'Operations Officer' },
];

export const ROLE_LABELS: Record<RoleKey, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  ENGINEER: 'Engineer',
  TECHNICIAN: 'Technician',
  OPERATIONS: 'Operations Officer',
};

export const ROUTE_ACCESS: Record<string, RoleKey[]> = {
  '/dashboard': ROLE_OPTIONS.map((role) => role.key),
  '/aircraft': ['ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'OPERATIONS'],
  '/crew': ['ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'OPERATIONS'],
  '/policies': ['ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'OPERATIONS'],
  '/flight-logs': ['ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'OPERATIONS'],
};

