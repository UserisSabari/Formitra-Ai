import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';

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
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading Formitra…</div>}>
          <Routes>
          {/* Standalone mock portal (no Formitra layout shell) */}
          <Route path="/mock-portal" element={<MockPortalPage />} />

            <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/apply/:serviceId/state" element={<SelectStatePage />} />
            <Route path="/apply/:serviceId/:state/documents" element={<DocumentUploadPage />} />
            <Route path="/apply/:serviceId/:state/form" element={<PassportFormPage />} />
            <Route path="/apply/:serviceId/:state/review" element={<ReviewPage />} />
            <Route path="/apply/success" element={<SuccessPage />} />
            <Route path="/apply/:serviceId/coming-soon" element={<ComingSoonPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ErrorBoundary>
</StrictMode>
);
