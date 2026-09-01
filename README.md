# DevFlow — Enterprise Multi-Tenant SaaS Platform

DevFlow is a full-stack project management and real-time developer collaboration platform built for software teams, digital agencies, and enterprise organizations. Combining key workflow features from industry standards like Linear, Jira, and GitHub, DevFlow delivers multi-tenant workspace isolation, fluid drag-and-drop Kanban task management, role-based access control (RBAC), WebSocket updates, system audit streams, and a Light & Dark theme system.

---

## 👨‍💻 Created & Developed By

**Hardik Gurjar**
- **GitHub**: [Hardik-18449](https://github.com/Hardik-18449)
- **Project Repository**: [DevFlow Repository](https://github.com/Hardik-18449/DevFlow)

---

## Capabilities & Architecture

- **Multi-Tenant Workspace Isolation**: Secure, tenant-scoped database architecture supporting isolated organizations, project rosters, and member permissions.
- **Dual-Level Role-Based Access Control (RBAC)**:
  - **Organization Level Roles**: `OWNER`, `ADMIN`, `MEMBER`.
  - **Project Level Roles**: `PROJECT_MANAGER`, `DEVELOPER`, `VIEWER`.
- **Drag-and-Drop Kanban Board**: Real-time task status tracking (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `BLOCKED`, `DONE`) powered by `@dnd-kit`.
- **Real-Time Collaboration**: Room-scoped Socket.IO events broadcasting live task movements, status updates, comments, and user notifications.
- **Enterprise Dark & Light Theme System**: Theme engine with custom CSS properties, smooth mode transitions, and persistent user preference storage.
- **Visual Analytics**: Interactive completion velocity bar charts and task breakdown distribution charts powered by Recharts.
- **Immutable Audit Logging**: Detailed audit records capturing every task movement, assignment update, and comment creation.
- **Password Visibility Controls**: Inline show/hide toggle buttons on authentication forms.
- **Pre-seeded Demo Mode**: 1-Click demo authentication buttons for instant testing and presentation.

---

## Technology Stack

### Frontend Architecture
| Layer | Technology |
|---|---|
| Core Framework | React.js (v18) + Vite |
| State Management | Redux Toolkit & RTK Query |
| Styling System | Tailwind CSS + CSS Custom Variables (Dark & Light Themes) |
| Iconography | Lucide React |
| Drag & Drop Engine | `@dnd-kit/core` & `@dnd-kit/sortable` |
| Real-Time Communication | Socket.IO Client |
| Data Visualization | Recharts |

### Backend Architecture
| Layer | Technology |
|---|---|
| Runtime & Server | Node.js + Express.js |
| Primary Database | MongoDB + Mongoose ORM |
| Caching & Queues | Redis + BullMQ (with automatic fallback) |
| Real-Time Engine | Socket.IO Server |
| Security & Validation | JWT (Access & Refresh Tokens), Bcryptjs, Helmet, Express-Rate-Limit, Zod |
| Automated Testing | Jest + Supertest |

---

## Quick Start Guide

### System Prerequisites
- Node.js >= v18.0.0
- MongoDB instance (Local URI or MongoDB Atlas Cluster)
- Redis Server (Optional; automatically falls back if unavailable)

### 1. Repository Setup & Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/devflow.git
cd devflow

# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/devflow
JWT_ACCESS_SECRET=your_jwt_access_secret_key_12345
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_67890
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://127.0.0.1:6379
```

### 3. Database Auto-Seeding & Local Execution
```bash
# Start Backend Server (Terminal 1)
cd server
npm start

# Start Frontend Dev Server (Terminal 2)
cd client
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## Demo Authentication Credentials

For instant demonstration and role testing, use the 1-Click buttons on the login page or enter credentials manually:

| Workspace Role | Email Address | Password | Permissions |
|---|---|---|---|
| Organization Owner | `owner@devflow.com` | `Password123!` | Full workspace administration & member management |
| Organization Admin | `admin@devflow.com` | `Password123!` | Project management & team member invitation |
| Lead Developer | `rahul@devflow.com` | `Password123!` | Task creation, status updates & code comments |
| UI/UX Specialist | `priya@devflow.com` | `Password123!` | Task creation, board sorting & activity monitoring |

---

## REST API Specification

### Authentication Routes (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Register user and provision initial workspace.
- `POST /api/v1/auth/login` — Authenticate credentials and return JWT tokens.
- `POST /api/v1/auth/refresh` — Issue new access token via refresh token.
- `POST /api/v1/auth/logout` — Clear session tokens and active cookies.

### Organization Management (`/api/v1/organizations`)
- `GET /api/v1/organizations` — Fetch user's active organizations.
- `POST /api/v1/organizations` — Create a new organization workspace.
- `GET /api/v1/organizations/:id/members` — List organization roster.
- `POST /api/v1/organizations/:id/invitations` — Send team invitation.
- `POST /api/v1/organizations/invitations/accept` — Accept invitation token.

### Project & Task Routes (`/api/v1/projects`, `/api/v1/tasks`)
- `GET /api/v1/organizations/:orgId/projects` — Fetch projects within organization.
- `POST /api/v1/organizations/:orgId/projects` — Create project workspace.
- `GET /api/v1/projects/:id` — Get detailed project scope and metadata.
- `GET /api/v1/projects/:id/tasks` — Fetch task list with status/priority filters.
- `POST /api/v1/projects/:id/tasks` — Create task within project.
- `PATCH /api/v1/tasks/:id/status` — Move task status on Kanban board.
- `DELETE /api/v1/tasks/:id` — Remove task record.
- `POST /api/v1/tasks/:id/comments` — Post task comment with @mentions.

---

## Production Deployment Guide

### Option 1: Vercel (Client) + Render / Railway (Backend)
1. **Frontend Deployment (Vercel)**:
   - Connect repository and select `client` directory as Root Directory.
   - Set Build Command to `npm run build` and Output Directory to `dist`.
2. **Backend Deployment (Render / Railway)**:
   - Select `server` directory as Root Directory.
   - Set Start Command to `npm start`.
   - Add Environment Variables (`MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).

### Option 2: Docker Containerization
```bash
# Build and launch services in background
docker-compose up --build -d
```
Runs MongoDB, Redis, Node API server (Port 5000), and static Client Nginx container (Port 5173).

---

## Verification & Testing

To execute automated backend integration tests:
```bash
cd server
npm test
```

To build production frontend distribution:
```bash
cd client
npm run build
```
