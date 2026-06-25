# DRISHYAM
## AI-Powered Helicopter Maintenance & Operations Intelligence Platform

Version: 1.0
Status: Approved Architecture
Purpose: Master Project Requirements & Development Guide

---

# 1. PROJECT OVERVIEW

DRISHYAM is a web-based AI-powered helicopter maintenance and operations intelligence platform.

The platform centralizes:

- Aircraft Management
- Flight Log Management
- Maintenance Management
- Snag Management
- Crew Management
- Crew Shift Planning
- Policy Administration
- Knowledge Base
- Reporting & Analytics
- AI Knowledge Assistant
- Predictive Maintenance

The objective is to improve aircraft safety, maintenance efficiency, operational planning, and decision-making.

---

# 2. DEVELOPMENT PRINCIPLE

## RULE #1

DO NOT BUILD AI FIRST.

AI depends on data.

Data comes from:

- Aircraft Database
- Flight Logs
- Maintenance Records
- Snag Records
- Crew Records
- Policies
- Technical Manuals

Development Order:

Foundation
→ Operations
→ Analytics
→ AI
→ Advanced AI

NOT

AI
→ Everything Else

---

# 3. PROJECT TYPE

Platform Type:

- Web Application Only

Not Required:

- Mobile App
- PWA
- Desktop Application

Access Method:

- Browser-based dashboard

---

# 4. FINAL USER ROLES

## Administrator

Responsibilities:

- User Management
- Role Assignment
- Policy Management
- System Configuration
- Audit Monitoring
- Aircraft Registration

---

## Engineer

Responsibilities:

- Aircraft Inspection
- Flight Log Review
- Snag Creation
- Maintenance Approval
- Maintenance Planning
- AI Assistant Usage

---

## Technician

Responsibilities:

- Work Orders
- Maintenance Execution
- Snag Resolution
- Repair Documentation
- Parts Tracking

---

## Operations Officer

Responsibilities:

- Flight Scheduling
- Aircraft Availability
- Crew Allocation
- Shift Planning

---

## Manager

Responsibilities:

- Reports
- Analytics
- KPIs
- Aircraft Health Monitoring
- Strategic Decision Making

---

# 5. ROLE PERMISSIONS

| Module | Admin | Engineer | Technician | Operations | Manager |
|----------|---------|---------|---------|---------|---------|
| Users | Full | No | No | No | No |
| Aircraft | Full | Edit | View | View | View |
| Flight Logs | View | Full | View | Full | View |
| Maintenance | View | Full | Update | View | View |
| Snags | View | Full | Update | View | View |
| Crew | Full | View | View | Full | View |
| Policies | Full | View | View | View | View |
| Reports | Full | Generate | View | View | View |
| Analytics | Full | View | View | View | Full |
| AI Assistant | Yes | Yes | Yes | Yes | Yes |

---

# 6. SYSTEM MODULES

Core Modules:

1. Authentication
2. Dashboard
3. Aircraft Management
4. Crew Management
5. Flight Log Management
6. Maintenance Management
7. Snag Management
8. Crew Shift Planning
9. Policy Management
10. Knowledge Base
11. Reporting
12. Analytics
13. AI Assistant
14. Predictive Maintenance

---

# 7. RECOMMENDED TECHNOLOGY STACK

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts

---

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

---

## Database

PostgreSQL

Recommended Provider:

- Supabase PostgreSQL

Note:

Use Case document mentions MySQL.
PostgreSQL is approved for implementation because it provides better analytics support and scalability.

---

## Authentication

- JWT
- bcrypt

---

## Storage

- Supabase Storage

or

- AWS S3

---

## AI

Phase 1

- Gemini API

Phase 2

- FastAPI
- Python
- Pandas
- Scikit-Learn

Phase 3

- XGBoost
- Random Forest

---

## Deployment

Frontend:

- Vercel

Backend:

- Render

Database:

- Supabase

---

# 8. SYSTEM ARCHITECTURE

Frontend

React + TypeScript

↓

Backend API

Node.js + Express

↓

PostgreSQL Database

↓

Document Storage

Policies
Manuals
Reports

↓

AI Service

Gemini
FastAPI
ML Models

---

# 9. PROJECT STRUCTURE

drishyam/

├── client/

├── server/

├── ai-service/

├── database/

├── docs/

└── README.md

---

# 10. DATABASE DESIGN

Core Tables

users

roles

permissions

aircraft

crew

crew_certifications

crew_shifts

flight_logs

maintenance_records

maintenance_tasks

snags

snag_history

policies

manuals

reports

notifications

audit_logs

training_records

recommendations

aircraft_health_scores

---

# 11. DEVELOPMENT ROADMAP

Phase 1

Authentication

Deliverables:

- Login
- JWT
- RBAC
- User Management

---

Phase 2

Aircraft Management

Deliverables:

- Aircraft CRUD
- Aircraft History
- Aircraft Status

---

Phase 3

Crew Management

Deliverables:

- Crew CRUD
- Certifications
- Availability
- Shift Assignment

---

Phase 4

Flight Log Management

Deliverables:

- Flight Logs
- Utilization Tracking
- Flight History

---

Phase 5

Maintenance Management

Deliverables:

- Work Orders
- Maintenance Tracking
- Repair History
- Parts Tracking

---

Phase 6

Snag Management

Deliverables:

- Snag Logging
- Severity Classification
- Status Tracking
- Resolution Tracking

---

Phase 7

Policy Management

Deliverables:

- Policy CRUD
- Version History
- Access Control

---

Phase 8

Knowledge Base

Deliverables:

- Manual Upload
- Document Upload
- Search
- Categorization

---

Phase 9

Reporting

Deliverables:

- PDF Reports
- Excel Reports
- CSV Export

---

Phase 10

Analytics

Deliverables:

- Aircraft Health Dashboard
- Maintenance Trends
- Snag Trends
- Crew Utilization

---

Phase 11

AI Assistant

Version 1

Gemini API

Capabilities:

- Ask Manuals
- Ask Policies
- Ask Snags
- Search Knowledge Base

Architecture:

User Question
→ Search Documents
→ Provide Context
→ Gemini
→ Response

---

Phase 12

Recommendation Engine

Version 1

Rule-Based

Example:

IF

Engine Temperature > Threshold

AND

Repeated Snag Exists

THEN

Recommend:

Cooling System Inspection

---

Phase 13

Predictive Maintenance

Requirements:

Historical Data

Inputs:

- Flight Hours
- Engine RPM
- Temperature
- Failure History

Models:

- Random Forest
- XGBoost

Outputs:

- Maintenance Recommendation
- Risk Score
- Inspection Alert

---

# 12. MVP DEFINITION

Project is MVP COMPLETE when:

✓ Login Works

✓ Aircraft CRUD Works

✓ Crew CRUD Works

✓ Flight Logs Work

✓ Maintenance Works

✓ Snag Management Works

✓ Dashboard Works

✓ Reports Work

AI is NOT required for MVP.

---

# 13. HERO VERSION

Project reaches HERO STATE when:

✓ AI Knowledge Assistant

✓ Root Cause Suggestions

✓ Aircraft Health Scoring

✓ Predictive Maintenance

✓ Crew Planning Automation

✓ Analytics Dashboard

✓ Fleet Integration

✓ Security Layer

---

# 14. SECURITY REQUIREMENTS

Required:

- RBAC
- JWT Authentication
- Password Hashing
- Audit Logs
- Data Encryption
- Backup Strategy

Future:

- AES-256 Encryption
- Disaster Recovery
- SSO
- LDAP

---

# 15. EXTERNAL INTEGRATIONS

Future Scope

- Fleet APIs
- Weather APIs
- ERP Systems
- SAP Systems
- HR Systems
- Email Services
- Notification Services

Not required for MVP.

---

# 16. AI DEVELOPMENT STRATEGY

Version 1

Rule-Based Recommendations

Version 2

Gemini Knowledge Assistant

Version 3

RAG Knowledge Base

Version 4

Predictive Maintenance Models

Version 5

Continuous Learning Engine

---

# 17. IMPORTANT DEVELOPMENT RULES

1. Database First

2. Backend Before Frontend

3. CRUD Before Analytics

4. Analytics Before AI

5. AI Before Machine Learning

6. Machine Learning Requires Historical Data

7. MVP Must Be Completed Before AI Features

8. Every Module Must Have:
   - Database Table
   - Backend API
   - Frontend UI
   - Validation
   - Role Permissions

---

# 18. REFERENCE DOCUMENTS

Reference 1:

DRISHYAM System Architecture Diagram

Reference 2:

DRISHYAM Use Case Specification Document

UC-01 → Predictive Maintenance

UC-03 → Correlation Analysis

UC-04 → Snag Analysis

UC-05 → Maintenance Recommendations

UC-06 → Training Recommendations

UC-07 → Knowledge Base Search

UC-08 → Crew Planning

UC-09 → Policy Management

UC-11 → Reporting

UC-12 → Integrations

UC-13 → Aircraft Management

---

END OF DOCUMENT