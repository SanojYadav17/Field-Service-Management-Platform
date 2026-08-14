# 🗝️ KEYSTONE Field OS v2.0 Enterprise

> Next-Generation Enterprise Field Service Automation, Live GPS Dispatch, SLA Compliance Engine & Inventory Intelligence Platform.

![Tech Stack](https://img.shields.io/badge/Stack-Spring%20Boot%203%20%7C%20React%2018%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-emerald)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen)

---

## 🌟 Overview

**KEYSTONE Field OS** is a full-stack, enterprise-grade Field Service Management (FSM) platform designed to streamline dispatch operations, field technician workflows, SLA compliance, customer ticketing, and spare parts inventory management.

### Key Capabilities:
- **🛡️ Multi-Role Security (RBAC)**: Role-based access control for **Administrators**, **Dispatchers**, **Technicians**, and **Customers**.
- **⚡ Operations Command & Quick Dispatch**: Real-time SLA tracking, automated breach alerts, and 1-click batch technician dispatching based on live workload metrics.
- **🔧 Mobile Technician Field Workspace**: On-site HTML5 GPS check-in (coordinates + open reverse geocoding) & digital customer sign-off canvas.
- **🏢 Customer Self-Service Portal**: Ticket submission with a 4-step visual progress bar (`Submitted` ➔ `Assigned` ➔ `GPS Checked-In` ➔ `Signed & Closed`).
- **📊 Advanced Analytics & Reports**: Technician leaderboard, SLA priority compliance rates, inventory consumption tracking, and 1-click CSV report export.
- **🔍 Global Command Palette (`Ctrl+K` / `Cmd+K`)**: Multi-category instant search across Work Orders, Customers, Sites, Parts, and Technicians.

---

## 🚀 Tech Stack

### Backend:
- **Java 21 / Spring Boot 3.4**
- **Spring Security** (Bcrypt password hashing + JWT session authentication)
- **Neon PostgreSQL** (SSL Database connection pooler with JPA/Hibernate)
- **RESTful API Architecture**

### Frontend:
- **React 18 + TypeScript + Vite**
- **Vanilla CSS + Tailwind Utility Framework** (Custom Keystone Luminous Light Glassmorphism UI)
- **Lucide React Icons**

---

## 🔐 Quick Demo Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@meridian.com` | `password123` | Full System Control, Users, Telemetry, Reports |
| **Dispatcher** | `dispatcher@meridian.com` | `password123` | Operations Command, Quick Dispatch Matrix, Kanban |
| **Technician** | `tech.john@meridian.com` | `password123` | Mobile Field Workspace, GPS Check-In, Digital Sign-Off |
| **Customer** | `customer.acme@meridian.com` | `password123` | Ticket Submission, Visual Progress Stepper, Portal |

---

## 🛠️ Getting Started Locally

### Prerequisites:
- **Java 21 JDK** or higher
- **Node.js 18+** and `npm`

### 1. Run Spring Boot Backend
```bash
# In project root directory:
./mvnw spring-boot:run
# Backend API runs on http://localhost:8080
```

### 2. Run Vite Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend SPA runs on http://localhost:5173
```

---

## 📦 Production Deployment & Build

To build the static frontend bundle and package it into the Spring Boot executable JAR:

```bash
# Build Frontend Bundle:
cd frontend
npm run build

# Build Executable Production JAR:
cd ..
./mvnw clean package -DskipTests
```

---

## 📄 License
Licensed under the [MIT License](LICENSE). Built for enterprise field service intelligence.
