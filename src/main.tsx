import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dashboard from './pages/Dashboard.tsx'
import PatientDashboard from './pages/PatientDashboard.tsx'
import Patients from './pages/Patients.tsx'
import Agenda from './pages/Agenda.tsx'
import Rapports from './pages/Rapports.tsx'
import Auth from './pages/Auth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientDashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="rapports" element={<Rapports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
