import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import Leads from './routes/Leads';
import LeadDetail from './routes/LeadDetail';
import AddLead from './routes/AddLead';
import TodaysCalls from './routes/TodaysCalls';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/new" element={<AddLead />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="today" element={<TodaysCalls />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
