# Anglican Model College (AMCO) — Offline School Management System

A self-contained, offline-first school management desktop application designed for Nigerian secondary schools, covering both **Junior Secondary (JSS 1 to JSS 3)** and **Senior Secondary (SSS 1 to SSS 3)**, with class arms removed.

Redesigned following **Shadcn/ui** and **Radix Primitives** design principles (minimalist Zinc/Slate aesthetic, segmented pill tabs, Sonner-style toasts, Radix dialogs, metric cards, and responsive layouts).

Delivered as static files that can be emailed in a `.zip` archive or transferred via USB, running directly in any modern desktop browser (Chrome, Edge, Firefox, Safari) by **double-clicking `index.html`** — **no web server, no dev tools, and zero internet connection needed**.

---

## 🚀 Quick Start

1. **Extract** the files if received as a `.zip` archive.
2. **Double-click `index.html`** in Windows Explorer (or open with any browser).
3. The application loads immediately with pre-seeded sample data (including **Adegbite Joanna** in **SSS 1**, matching Reference Page 1 & 2).

### 🔑 Default Credentials

| Role | Username | Password | Full Name & Title | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Alhaji / Rev. School Administrator | Full access: Student registration, database, junior/senior classes, subjects, report cards, JSON backup/restore |
| **Teacher** | `teacher` | `teacher123` | Mr. Siyanbola John (Class Tutor & Senior Math Teacher) | Score entry (CA & Exam), Form Tutor domain ratings & attendance, report cards |

> **Tester Convenience:** A **Quick Role Switcher** (`Admin` / `Teacher` / `Logout`) is permanently visible at the top right of the navigation header.

---

## 🎨 Shadcn/ui & Radix Primitives Redesign

1. **Minimalist Zinc/Slate Aesthetic:** Clean typography, high-contrast text (`text-foreground`), subtle muted labels (`text-muted-foreground`), and crisp borders (`border-border`).
2. **Radix Segmented Navigation:** Smooth pill-style segmented tab bar that scrolls smoothly on mobile devices with touch momentum.
3. **Shadcn Metric Dashboard Cards:** Top-level summary cards displaying Total Enrolled, Junior Secondary, Senior Secondary, and Active Subjects.
4. **Radix Dialog Primitives:** Centered modals with smooth scale-in and backdrop blur effects for authentication, candidate slips, and rosters.
5. **Sonner-Style Toast Notifications:** Unobtrusive, elegant slide-in notifications with distinct status borders.
6. **Full Mobile & Desktop Responsiveness:** Fluid grid columns that collapse gracefully from 4 columns on desktop to 2 on tablets and 1 on smartphones, with horizontal table scrolling.

---

## 🏫 Class Structure (Arms Removed)

The application models the Nigerian 6-3-3-4 secondary school structure without section arms:

- **Junior Secondary School:**
  - `JSS 1`
  - `JSS 2`
  - `JSS 3`
- **Senior Secondary School:**
  - `SSS 1`
  - `SSS 2`
  - `SSS 3`

### Curriculum & Subject Offerings:
- **Core / Languages:** Mathematics, English Language, Civic Education, Computer Studies, Agricultural Science, Yoruba.
- **Senior Sciences & Commercial (Reference Page 2):** Physics, Chemistry, Biology, Geography, Economics, Animal Husbandry.
- **Junior Core:** Basic Science, Basic Technology, Social Studies, Business Studies, Cultural & Creative Arts, Physical & Health Education.

---

## 📋 Features Overview

### 1. Student Registration Form (Admin)
- Located under the **Student Registration** tab.
- Replicates the **Anglican Model College Entrance Examination Form** (Reference Page 1) with exact field labels, section order, and layout:
  - Form No. (e.g., `0135`), Admission No. (e.g., `2508`), and Assigned Class (`JSS 1` to `SSS 3`).
  - `1. Name Of Applicant (surname First)`
  - `2. Sex`, `Religion`, `Denomination`
  - `3. Date Of Birth`, `Nationality`
  - `4. State Of Origin`, `L.G.A.`, `Home Town`
  - `5. Name Of Present School`, `Present Class`
  - `6. Name of Parent`
  - `7. Address of Parent/Guardian`
  - `8. Occupation of Father/Guardian`
  - `9. Occupation of Mother/Guardian`
  - `10. Name and Address of Person Who will be Responsible for Payment of Your Fees`
  - `11. Have you any Disability? (State, if any)`
  - `12. Are you allergic to inoculation/drug? (State, if any)`
  - `13. In case of emergency who to contact?`, `GSM NO.`
  - **Official Use Only Box:** Entrance exam scores in Mathematics, English, and General. Live computation of Average (%) and admission recommendation (`Admission GRANTED` or `Admission NON GRANTED`).
  - Auto-generates the printable **Candidate Examination & Identity Slip** from Reference Page 1 bottom.

### 2. Student Database & Searchable Directory
- Search students in real time by name, admission number, form number, or phone number.
- Filter by Class (`All`, `JSS 1`, `JSS 2`, `JSS 3`, `SSS 1`, `SSS 2`, `SSS 3`) and Gender.
- Quick action buttons: **Slip** (prints candidate examination slip), **Report Card** (generates semester report card), **Edit** (loads into registration form), and **Del** (deletion with safety check).

### 3. Junior & Senior Classes & Subject Assignment
- Manage classes across Junior and Senior divisions.
- Create new classes with assigned Form Tutors.
- **Manage Core Subjects:** Assign subjects class-wide.
- **Student Subject Override:** Customize individual student subject offerings.

### 4. Results Entry & Validation (Teacher)
- Teacher selects **Class** (e.g. `SSS 1`), **Subject** (e.g. `PHY - Physics`), and **Term**.
- Enter Continuous Assessment (C.A. `0 - 30`) and Exam (`0 - 70`).
- Auto-computes Term Total (`100%`), 3-Term Average (%), Grade, and Remarks.
- **Validation:** Scores exceeding limits (`CA > 30` or `Exam > 70` or `< 0`) highlight in red. Unintentional blanks trigger a warning before saving.
- **Testing Accelerator:** Includes a **⚡ Pre-fill Sample Scores** button for instant demonstration.

### 5. Form Tutor Domain & Attendance Assessment
- **Attendance Record:** Times School Opened, Times Present, Times Absent.
- **Behavioural (Affective Domain - 8 Traits):** Punctuality, Neatness, Attentiveness, Relationship with Others, Politeness, Responsiveness, Commitment, Consistency (scored `1` to `5`, max `40`).
- **Psychomotor Domain (7 Traits):** Crafts/Drawing, Technical Skills, ICT Skills, Gardening/Farming, Games & Sports, Creativity & Initiative, Verbal Fluency (scored `1` to `5`, max `35`).
- **Remarks & Promotion:** Class Tutor's Comment, Principal's Comment, Promotion Status (`PROMOTED`, `PROMOTED ON TRIAL`, `REPEAT`).

### 6. Print-Ready Report Card (Reference Page 2)
- Replicates the exact layout of the reference report card for senior student **Adegbite Joanna** (`SSS 1`, Adm No `2508`):
  - Institutional Header with AMCO crests, P.O. Box 1909 Ogbomoso, and Report Card banner.
  - 3-row x 5-column Student Info Grid: Roll No, Name, Gender, Adm No, Class, Subjects Offered, Passed, Failed, Total Students, and **Computed Class Position** (`1st`, `2nd`, etc.).
  - Academic Performance Table: S/NO, Subject, Marks Obtainable (100), 3rd Term C.A. (30%), 3rd Term Exam (70%), 3rd Term Total, 2nd Term Total, 1st Term Total, Average %, Grade, and Remarks.
  - Summary Row: Total Marks Obtainable (1200), Total Marks Obtained (952.9), % Average (79.4%).
  - Grade Interpretation Legend (`A: DISTINCTION`, `C: CREDIT / GOOD`, `P: PASS`, `F: FAIL`).
  - Affective and Psychomotor domain tables with obtained scores.
  - Class Tutor comment, Principal comment, Promotion status, and authentic AMCO Principal's Stamp & Signature box.
  - Resumption Notice: *"Next Term Begins on Monday, 14th September, 2026"*.
  - Click **🖨️ Print Report Card (A4)** to produce a single-sheet A4 printout.

### 7. Teachers & Academic Staff Management
- Located under the **Teachers & Staff** navigation tab (Admin only) and the **Login / Register** modal.
- **Two Ways to Register New Teachers:**
  1. **Admin Portal Registration:** Administrator navigates to *Teachers & Staff*, enters the teacher's full name, designation/role, assigns their class (`JSS 1` to `SSS 3`) and subject (e.g. `PHY`, `MTH`), and assigns their login username and password. The teacher is immediately saved into `localStorage` and appears in the Active Teachers Directory.
  2. **Self-Registration from Login Screen:** Any teacher opening the application can click **Login / Register** in the top bar, switch to the **Register as Teacher** tab, choose their class and subject, and sign up. They are instantly registered and logged into their session.
- **Instant Session Switching:** Admin can click **Login As** next to any teacher in the directory to immediately view the portal through that teacher's perspective, pre-filtering the Results Entry spreadsheet to their assigned class and subject.
- **Permanent Offline Persistence:** Registered teachers persist in local browser storage across sessions and computer restarts without internet or server connectivity.
- **Data Safety Note:** Teachers are saved in the live offline database. **Resetting data is NOT required to create teachers** (resetting actually restores factory demo defaults).

### 8. Offline Data Persistence & Portability
- Persists automatically in browser `localStorage`.
- **Download Backup (.json):** Exports the full database as a timestamped JSON file.
- **Restore Database from JSON:** Restores records from any exported JSON backup.
- **Reset Database to Default:** Reverts to the clean seed dataset anytime.

---

## 📂 File and Folder Structure

```
reportSchool/
├── index.html              # Single Page Application entry point (Shadcn/ui design)
├── README.md               # User manual, credentials, and documentation
├── css/
│   ├── style.css           # Shadcn/ui & Radix design system (100% offline, responsive)
│   └── print.css           # Single-sheet A4 print layout for report cards and slips
└── js/
    ├── icons.js            # Standalone offline React Icons (Lucide/Feather vector SVGs)
    ├── data.js             # Default seed database: JSS 1-3, SSS 1-3, subjects, Adegbite Joanna
    ├── store.js            # Offline localStorage manager, JSON backup/export/import
    ├── auth.js             # User session management, role enforcement (Admin vs. Teacher)
    ├── teachers.js         # Teacher registration, staff directory, session switching
    ├── students.js         # Student registration form (Page 1) and searchable directory
    ├── classes.js          # Junior & Senior classes and subject assignment logic
    ├── scores.js           # Results entry spreadsheet, validation, affective & psychomotor rating
    ├── report-card.js      # Reference Page 2 report card generator, ranking engine, print formatter
    └── app.js              # Application controller, tab router, toast alerts, modal handlers
```
