# Digital ID Card Generator

A modern full-stack web application for generating, previewing, downloading, and verifying University Student Identity Cards with real machine-readable Code 128 barcodes.

## Project Structure

```
├── backend/                  # Express REST API & JSON database
│   ├── data/
│   │   └── id_cards.json     # Student records database
│   ├── server.js             # Express server & API endpoints
│   ├── package.json
│   └── .env.example
├── frontend/                 # React (Vite) single-page application
│   ├── public/               # Static assets (logos, background)
│   ├── src/
│   │   ├── components/       # UI components (form, preview, admin)
│   │   ├── App.jsx           # Main application router & logic
│   │   └── App.css           # Glassmorphic UI styles
│   ├── package.json
│   └── .env.example
├── .gitignore                # Git ignore rules
└── .env.example              # Root environment configuration template
```

## Features

- **Two-Step ID Card Form**: Step 1 for Front details (Name, Roll No, Department, Batch, Blood Group, Residence, Contact, Photo) and Step 2 for Back details (Father's Name, Address).
- **Interactive Previews**: Instant toggle between Front, Back, and Both card views.
- **Code 128 Barcodes**: Real machine-readable Code 128 vector barcodes encoding student verification URLs.
- **Card Download**: High-resolution PNG card export (Front, Back, or Both sides).
- **Student Verification Page**: Public verification endpoint (`/verify/:cardId`) verifying student credentials against the database.
- **Administrator Dashboard**: Admin portal to view registered students, create new credentials, edit records, revoke/reactivate cards, or delete records.
- **Theme Support**: Seamless Light Mode and Dark Mode toggle with responsive mobile layouts.

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5001`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs on `http://localhost:5173`.

## Environment Variables

Copy the example environment files to configure custom ports or endpoints:

```bash
cp .env.example .env
```
# idcard
# idcard
# idcard
# idcard
