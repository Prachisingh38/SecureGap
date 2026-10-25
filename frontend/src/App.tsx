import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { FindingsPage } from '@/pages/FindingsPage';
import { GapsPage } from '@/pages/GapsPage';
import { ControlsPage } from '@/pages/ControlsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="findings" element={<FindingsPage />} />
          <Route path="gaps" element={<GapsPage />} />
          <Route path="controls" element={<ControlsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
