import type { Aircraft, CrewMember, Policy, ActivityLog, MaintenanceAlert } from '../types';

export const mockAircrafts: Aircraft[] = [
  {
    aircraftNumber: 'VT-DRA',
    model: 'Airbus A320neo',
    manufacturer: 'Airbus',
    status: 'AOG',
    flightHours: 8420,
    nextInspection: '2026-06-25'
  },
  {
    aircraftNumber: 'VT-DRB',
    model: 'Boeing 737 Max 8',
    manufacturer: 'Boeing',
    status: 'Active',
    flightHours: 12450,
    nextInspection: '2026-07-12'
  },
  {
    aircraftNumber: 'VT-DRC',
    model: 'Boeing 787-9 Dreamliner',
    manufacturer: 'Boeing',
    status: 'Active',
    flightHours: 18900,
    nextInspection: '2026-08-05'
  },
  {
    aircraftNumber: 'VT-DRD',
    model: 'ATR 72-600',
    manufacturer: 'ATR',
    status: 'Maintenance',
    flightHours: 5210,
    nextInspection: '2026-06-28'
  },
  {
    aircraftNumber: 'VT-DRE',
    model: 'Bombardier CRJ900',
    manufacturer: 'Bombardier',
    status: 'Active',
    flightHours: 9780,
    nextInspection: '2026-07-20'
  },
  {
    aircraftNumber: 'VT-DRF',
    model: 'Airbus A350-900',
    manufacturer: 'Airbus',
    status: 'Active',
    flightHours: 14200,
    nextInspection: '2026-09-01'
  }
];

export const mockCrew: CrewMember[] = [
  {
    id: 'CREW-001',
    name: 'Capt. Rajesh Sharma',
    designation: 'Captain (A320)',
    email: 'rajesh.sharma@drishyam.aero',
    status: 'Flight Duty',
    phone: '+91 98765 43210'
  },
  {
    id: 'CREW-002',
    name: 'F/O Rohan Verma',
    designation: 'First Officer (B737)',
    email: 'rohan.verma@drishyam.aero',
    status: 'Active',
    phone: '+91 98765 43211'
  },
  {
    id: 'CREW-003',
    name: 'Elena Rostova',
    designation: 'Lead Cabin Crew',
    email: 'elena.rostova@drishyam.aero',
    status: 'Active',
    phone: '+91 98765 43212'
  },
  {
    id: 'CREW-004',
    name: 'Vikram Patel',
    designation: 'Chief Maintenance Engineer',
    email: 'vikram.patel@drishyam.aero',
    status: 'Active',
    phone: '+91 98765 43213'
  },
  {
    id: 'CREW-005',
    name: 'Sarah Connor',
    designation: 'First Officer (A350)',
    email: 'sarah.connor@drishyam.aero',
    status: 'On Leave',
    phone: '+91 98765 43214'
  },
  {
    id: 'CREW-006',
    name: 'David Miller',
    designation: 'Cabin Crew Member',
    email: 'david.miller@drishyam.aero',
    status: 'Flight Duty',
    phone: '+91 98765 43215'
  },
  {
    id: 'CREW-007',
    name: 'Anjali Desai',
    designation: 'Avionics Engineer',
    email: 'anjali.desai@drishyam.aero',
    status: 'Active',
    phone: '+91 98765 43216'
  }
];

export const mockPolicies: Policy[] = [
  {
    id: 'POL-101',
    title: 'Minimum Equipment List (MEL) Airbus A320neo Rev 14.2',
    category: 'Operations',
    uploadDate: '2026-05-15',
    version: '14.2',
    fileSize: '4.8 MB'
  },
  {
    id: 'POL-102',
    title: 'Safety Management System (SMS) Manual v3.0',
    category: 'Safety',
    uploadDate: '2026-06-01',
    version: '3.0',
    fileSize: '12.4 MB'
  },
  {
    id: 'POL-103',
    title: 'Cold Weather Ground Operations Policy',
    category: 'Flight Operations',
    uploadDate: '2025-11-10',
    version: '1.1',
    fileSize: '2.1 MB'
  },
  {
    id: 'POL-104',
    title: 'Fuel Management & Conservation Guidelines',
    category: 'Regulatory',
    uploadDate: '2026-04-20',
    version: '2.5',
    fileSize: '3.6 MB'
  },
  {
    id: 'POL-105',
    title: 'Line Maintenance Tech Procedures (EASA Part-145)',
    category: 'Maintenance',
    uploadDate: '2026-06-18',
    version: '8.9',
    fileSize: '18.2 MB'
  }
];

export const mockActivities: ActivityLog[] = [
  {
    id: 'ACT-001',
    timestamp: '2026-06-22T11:45:00Z',
    message: 'Aircraft VT-DRA grounded (AOG) due to hydraulic pressure warning in Engine 1.',
    type: 'critical'
  },
  {
    id: 'ACT-002',
    timestamp: '2026-06-22T10:15:00Z',
    message: 'Policy "Line Maintenance Tech Procedures v8.9" uploaded by Chief Engineer Vikram Patel.',
    type: 'success'
  },
  {
    id: 'ACT-003',
    timestamp: '2026-06-22T09:00:00Z',
    message: 'Scheduled A-check completed successfully for Boeing 737 VT-DRB.',
    type: 'success'
  },
  {
    id: 'ACT-004',
    timestamp: '2026-06-22T07:30:00Z',
    message: 'Crew roster reassignment completed: F/O Rohan Verma assigned to Flight DR-204.',
    type: 'info'
  },
  {
    id: 'ACT-005',
    timestamp: '2026-06-22T05:20:00Z',
    message: 'Cabin oxygen system pressure check warning reported on ATR 72 VT-DRD.',
    type: 'warning'
  }
];

export const mockMaintenanceAlerts: MaintenanceAlert[] = [
  {
    id: 'ALT-001',
    aircraftNumber: 'VT-DRA',
    severity: 'critical',
    message: 'AOG: Hydraulic System Leak in Main Landing Gear Actuator.',
    reportedAt: '2 hours ago'
  },
  {
    id: 'ALT-002',
    aircraftNumber: 'VT-DRD',
    severity: 'warning',
    message: 'C-Check inspection overdue in 3 days.',
    reportedAt: '5 hours ago'
  },
  {
    id: 'ALT-003',
    aircraftNumber: 'VT-DRB',
    severity: 'info',
    message: 'Left Engine Fuel Filter replacement due at next 100-hour servicing.',
    reportedAt: '1 day ago'
  }
];
