import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SelectStatePage from './pages/SelectStatePage';
import PassportFormPage from './pages/PassportFormPage';
import ReviewPage from './pages/ReviewPage';
import SuccessPage from './pages/SuccessPage';
import ComingSoonPage from './pages/ComingSoonPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-state/:serviceId" element={<SelectStatePage />} />
          <Route path="/form/:serviceId/:state" element={<PassportFormPage />} />
          <Route path="/review/:serviceId/:state" element={<ReviewPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/coming-soon/:serviceId" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
