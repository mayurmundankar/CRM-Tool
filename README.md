# FlowMS • Interior Design & Revit Automation CRM

A modern CRM and Client Portal tailored for interior design and architecture studios specializing in AI-driven Autodesk Revit documentation workflows (lighting plans, plumbing plans, elevations, and 3D deliverables).

Built with **Next.js 16 App Router**, **TypeScript**, **shadcn/ui**, **Tailwind CSS**, and **Supabase**. Ready for one-click deployment to **Vercel**.

---

## 🌟 Key Features (Aligned with JD Requirements)

### 1. Interior Design Client Pipeline (Kanban & Directory)
- Visual stage tracking tailored for interior design studios:
  - *Inbound Leads → Consultation & Discovery → Concept & Moodboard → Schematic Planning → Revit BIM & Tech Drawings → Procurement & Specs → Execution & Site Build → Handover & Reveal*
  - Filter by Property Type (*Luxury Villa, Penthouse, Commercial Office, Boutique Retail, Hospitality & Lounge*)
  - Quick stage update dropdowns and budget tracking ($1.6M+ live pipeline).

### 2. Revit BIM Deliverables & Automation Tracker
- Automated documentation tracking for:
  - **Lighting & Switching Plans** (Revit Sheet `E-101`)
  - **Plumbing & Fixture Elevations** (Revit Sheet `P-201`)
  - **Custom Joinery Millwork Elevations** (Revit Sheet `ID-304`)
  - **3D Photorealistic Renderings**
- **Productivity Gain Tracker**: Automatically logs time saved per automated plan, reducing manual 2–3 hour drafting tasks to minutes.
- Built-in "Execute AI Automation" simulator for generating new Revit sheet deliverables.

### 3. Client-Facing Project Management Portal
- Dedicated interactive client view (`/portal` mode) for clients like Eleanor Vance:
  - Live milestone progress percentage and completion dates.
  - Interactive architectural sheet reviewer with approval sign-off buttons and feedback notes.
  - Confetti celebration upon milestone approval.
  - 1-click WhatsApp concierge connection with the lead architect.

### 4. WhatsApp Multi-Channel Client Automation
- Automated notification simulator and audit trail for client touchpoints:
  - *New Lighting Plan Ready for Review*
  - *Milestone Phase Completed*
  - *Urgent Sign-Off Request*
  - *Site Inspection & Progress*
- Live mobile WhatsApp preview with end-to-end encryption aesthetics and delivery double blue ticks.

### 5. Intelligent BIM Specification Studio (AI Hub)
- Interactive prompt-to-spec generator:
  - Space zone selector (*Master Ensuite, Gourmet Kitchen, Penthouse Salon, Executive Boardroom*)
  - Generates calculated lux photometric specifications, plumbing rough-in elevations, and millwork veneer codes.
  - Copyable directly into Revit schedule annotations.

### 6. Milestone Invoicing & Retainer Billing
- Milestone billing linked directly to Revit technical documentation sign-offs.
- Tracks paid, pending, and overdue invoices with downloadable receipts.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router, Turbopack, React 19)
- **UI Components**: Strictly [shadcn/ui](https://ui.shadcn.com/) (Button, Card, Badge, Dialog, Tabs, DropdownMenu, Avatar, Progress, Separator, Table, Input, Textarea)
- **Styling**: Tailwind CSS with custom luxury interior architecture palette (Obsidian, Warm Stone, Champagne Gold accents)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Client SDK) with automatic persistent local storage fallback
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Run Locally
```bash
# Dependencies already installed
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Connect Supabase (Optional)
The application works immediately out of the box with built-in demonstration data. To connect your live Supabase database:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the schema file located in:
   ```
   supabase/schema.sql
   ```
3. Copy your project URL and Anon Key into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart your Next.js server (`npm run dev`). The top header will automatically indicate **"Supabase Connected"**.

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/new).
3. (Optional) Add your Supabase environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.
