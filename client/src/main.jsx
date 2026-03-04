import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

const Layout = lazy(() => import('./components/Layout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SelectStatePage = lazy(() => import('./pages/SelectStatePage'));
const PassportFormPage = lazy(() => import('./pages/PassportFormPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'));
const DocumentUploadPage = lazy(() => import('./pages/DocumentUploadPage'));
const MockPortalPage = lazy(() => import('./pages/MockPortalPage'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading Formitra…</div>}>
        <Routes>
          {/* Standalone mock portal (no Formitra layout shell) */}
          <Route path="/mock-portal" element={<MockPortalPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/select-state/:serviceId" element={<SelectStatePage />} />
            <Route path="/form/:serviceId/:state" element={<PassportFormPage />} />
            <Route path="/upload/:serviceId/:state" element={<DocumentUploadPage />} />
            <Route path="/review/:serviceId/:state" element={<ReviewPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/coming-soon/:serviceId" element={<ComingSoonPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
