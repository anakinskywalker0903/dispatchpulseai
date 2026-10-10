# DispatchPulse AI — Field Service Dispatch & Replanning Agent

DispatchPulse AI is an enterprise-grade, human-in-the-loop field service scheduling and dynamic replanning platform. It combines a **deterministic constraint satisfaction engine** with an **autonomous LLM planning agent (Groq Llama 3.3 70B)** to assign, balance, and adapt service request work orders across a team of technicians for a working day.

---

## Key Features

1. **Deterministic Constraint Satisfaction (Zero Hallucination)**
   - Hard enforcement of technician skill certifications.
   - Strict adherence to technician working hours (`08:00 – 18:00`) and protected lunch breaks (`12:00 – 13:00`).
   - Algorithmic prevention of double-booking (interval disjoint check).
   - Maximum daily workload caps (e.g., 420 minutes per technician).
   - Immutability of completed work orders: in-progress or completed jobs cannot be shifted or removed.

2. **Autonomous AI Planning Agent (Groq Llama 3.3 70B + Heuristic Fallback)**
   - Formulates conflict-free dispatch proposals in under 500ms using Groq LPUs.
   - Generates trade-off analysis (e.g. why emergency tickets were prioritized over low-priority routine tasks, cross-region travel explanations).
   - Proactive Risk Radar: highlights tight 15-minute buffers and high-capacity technicians.
   - Drafts clarification questions for customer work orders missing critical details (e.g., gate codes, equipment serial numbers).
   - Built-in deterministic heuristic solver fallback: if no API key is provided or during rate limits, the app seamlessly runs offline with zero failure states.

3. **Human-in-the-Loop Approval Gate**
   - The AI agent proposes a **Draft Schedule (vX)** and cannot unilaterally finalize assignments.
   - The human dispatcher reviews recommendations, trade-offs, and diffs before clicking **Approve & Dispatch**.
   - Dispatchers can manually override or reschedule any assignment, with real-time deterministic conflict detection and required override justification logging.

4. **Dynamic Disruption Simulation & Replanning**
   - **Technician Breakdown Simulation:** Replaces or unassigns pending tasks when a technician's vehicle breaks down or they call in sick, while **preserving completed morning tasks**.
   - **Emergency Ticket Injection:** Injects urgent, critical tasks (e.g., Hospital ICU Generator Transfer Switch failure) and recalculates the daily schedule.
   - **"What Changed & Why" Diff Viewer:** Side-by-side comparison between versions showing rescheduled, reassigned, and newly allocated tasks with AI rationales.

5. **Conversational AI Dispatch Copilot (Interactive Chatbot)**
   - Dispatchers can query the schedule using natural language (e.g., *"Who has bandwidth for an emergency in Downtown?"*, *"Why couldn't Sarah take the industrial generator ticket?"*).
   - Chatbot provides actionable interactive suggestions: one-click triggers to inject emergencies or simulate disruptions straight from the conversation stream.
   - Powered by Groq LLaMA 3.3 70B with contextual schedule awareness.

6. **Full Operational Admin Panel**
   - **Work Orders Management:** Searchable and filterable ticket directory with custom work order creation (`+ New Service Request`), real-time status indicators, and deletion controls.
   - **Technicians Roster Management:** Roster control to onboard new technicians, edit skill qualifications and working hours, and toggle Active/Unavailable status.
   - **AI Telemetry & Solver Scorecard:** Live metrics dashboard tracking solver inference latency (~320ms on Groq LPU), hard constraint satisfaction rate (100%), and a real-time event stream.

7. **Schedule Snapshot Versioning & Immutable Audit Trail**
   - Retains full snapshot history (`v1: Initial AI Draft`, `v2: Dispatcher Approved`, `v3: Replanned after Disruption`).
   - One-click restore to any previous version.
   - Chronological audit log tracking every proposal, approval, override reason, and system event.
   - Mocked notification feed simulating SMS and Push alerts delivered to technicians and clients upon approval.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 16 (React 19)                  │
│                     Tailwind CSS UI Layer                   │
├──────────────────────────────┬──────────────────────────────┤
│  Interactive Gantt Board     │   Unassigned Queue Tray      │
│  Human Approval Banner       │   AI Insights & Diff Drawer  │
│  Manual Assignment Modal     │   Version History & Audit    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    API Route: /api/plan      ││    API Route: /api/validate │
├──────────────────────────────┤├─────────────────────────────┤
│ • Groq Llama 3.3 70B         ││ • Skill Matching Check      │
│ • Heuristic Constraint Solver││ • Shift & Break Time Check  │
│ • Schedule Diff Engine       ││ • Double-Booking Prevention │
│ • Missing Info Question Gen  ││ • Max Workload Limit Check  │
└──────────────────────────────┘└─────────────────────────────┘
```

---

## Completed Scope vs Excluded Scope

### Completed Scope
- Interactive Gantt timeline schedule (08:00 to 18:00) with technician utilization meters.
- Deterministic constraint engine with 100% test coverage for hard constraints.
- Groq Llama 3.3 70B agent integration with structured JSON schema output and verification.
- Offline deterministic heuristic solver fallback.
- Disruption simulations (Technician illness/breakdown and high-priority Emergency injection).
- Immutable completed job preservation during replanning.
- Schedule version snapshots and "What changed and why" diff calculator.
- Manual overrides with real-time constraint validation and mandatory reason logging.
- Immutable audit log and mock SMS/Push notification delivery center.
- Full test suite using Vitest.

### Excluded Scope (By Design)
- Real-time GPS tracking and live map routing APIs (bounded scenario design).
- Integration with external payroll or billing systems.
- Production SMS/telecom carrier gateways (simulated via mocked notification center).

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Installation
```bash
git clone <repository-url>
cd asynctask
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```
*(Note: If `GROQ_API_KEY` is omitted, DispatchPulse AI runs in deterministic heuristic mode with full scheduling capabilities).*

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Tests
Run the automated Vitest test suite:
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## Deployment Instructions

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. In the project settings, add the environment variable:
   - `GROQ_API_KEY`: your Groq API key.
4. Click **Deploy**. Vercel will build and serve the application globally with zero configuration.

---

## Reviewer Quick-Start Guide

1. **Initial Review:** Notice the initial baseline schedule proposal (v1) pending review in the **Human-in-the-Loop Approval Banner**.
2. **Inspect AI Reasoning:** Click **Review Trade-Offs & Diff** to inspect the AI's strategic decisions, risk radar, and drafted customer questions for missing info.
3. **Approve Plan:** Click **Approve & Dispatch**. Notice the mock notifications stream and audit log entry.
4. **Trigger Disruption 1 (Tech Breakdown):** Click **Tech Breakdown** in the top bar. Notice:
   - Marcus Vance is marked *Unavailable*.
   - Completed morning tasks remain strictly locked.
   - Remaining tasks are replanned and redistributed to qualified peers.
   - The diff tab displays exactly *"What changed and why"*.
5. **Trigger Disruption 2 (Hospital ICU Emergency):** Click **+ Emergency**. Notice the critical request SR-999 is ingested and dynamically slotted with priority.
6. **Manual Override:** Click on any task card on the timeline to edit the assignment. Notice that if you select an unqualified technician or an overlapping time, the deterministic engine prevents the error with an immediate alert.
