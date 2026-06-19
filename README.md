# Sindh Educational Academy (SEA) Ghotki Web Portal

Welcome to the official repository of the **Sindh Educational Academy (SEA) Ghotki Web Portal**. This is a premium, feature-rich web platform designed specifically for students preparing for competitive entry exams (MDCAT, ECAT) and local Sindh Board examinations (Matric, Intermediate).

---

## 📱 Progressive Web App (PWA) Installable
This portal is equipped with **Progressive Web App (PWA)** capabilities, allowing students and staff to install the web portal directly onto their mobile phones or desktop devices.
* **Add to Home Screen**: Fully compatible with Android, iOS (Safari), and desktop browsers.
* **Sleek Mobile App Shell**: Runs in a standalone window, removing browser URL bar distractions.
* **Resource Caching**: Caches static assets for lightning-fast loads.

---

## 🌟 Key Features

### 🎓 Student Features
* **Daily Streaks**: Encourages consistent preparation with active study streaks and streak counters.
* **Mock Exam Engine**: High-performance entry test simulator matching real ECAT/MDCAT rules, strict timers, question bookmarking, and automated negative marking.
* **Personalized Diagnostics**: Automatically tracks wrong answers and lists a student's weak subjects/topics on their dashboard, suggesting targeted review material.
* **MCQ Question Bank**: Globally searchable repository of practice questions with concept explanations.
* **Google Drive Sync**: Auto-enrollment grants student emails read-only access to premium lecture notes and videos on the Academy's Drive.

### 🏛️ Administration & Clerical Panels
* **Challan Validation Desk**: Clerks can instantly view uploaded fee slip photos and verify or reject bank transactions.
* **Google Drive Permission Automation**: Approving a voucher triggers the Google Drive API to automatically grant the student's Gmail account permission to access study material.
* **Audit Logging**: Tracks all administrative actions (like enrollments and validations) to secure system integrity.
* **Accounts Verification**: Nodemailer dispatch sends beautiful activation emails to verify user addresses before login.

---

## 🛠️ Technology Stack

* **Frontend**:
  * React.js (Vite configuration)
  * React Router (Client-side routing)
  * Lucide React (Premium modern icon package)
  * Custom Glassmorphic & Dark Mode CSS System
* **Backend API**:
  * Node.js & Express.js
  * MongoDB & Mongoose (Schemas & Database modeling)
  * Google Drive Workspace API Integration
  * Nodemailer (Email verification flow)
  * Multer & Magic Number verification (Secure file upload parser)

---

## 🚀 Local Development Setup

To run the project locally on your machine, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** installed.

### 2. Installation
Install dependencies for both the root API server and the frontend client:
```bash
# Install backend dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory using the following keys:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_google_drive_folder_id
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

### 4. Run the Application
Start both the Express backend API and the Vite development server concurrently:
```bash
npm run dev
```
The server will boot up at `http://localhost:5000` and the client will open at `http://localhost:5173`.
