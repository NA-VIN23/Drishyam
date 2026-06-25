export interface User {
  name: string;
  email: string;
  roleKey: string;
  roleLabel: string;
  avatarUrl?: string;
}

export type AircraftStatus = 'Active' | 'Maintenance' | 'AOG';

export interface Aircraft {
  aircraftNumber: string; // Tail Number
  model: string;
  manufacturer: string;
  status: AircraftStatus;
  flightHours: number;
  nextInspection: string; // ISO date string
}

export type CrewStatus = 'Active' | 'Flight Duty' | 'On Leave' | 'Suspended';

export interface CrewMember {
  id: string;
  name: string;
  designation: string;
  email: string;
  status: CrewStatus;
  phone?: string;
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  uploadDate: string; // ISO date string
  version: string;
  fileSize: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO date string
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface MaintenanceAlert {
  id: string;
  aircraftNumber: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  reportedAt: string;
}
