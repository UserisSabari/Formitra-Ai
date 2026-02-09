import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, ChevronRight, Home } from 'lucide-react';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const pathParts = location.pathname.split('/');
    const serviceId = pathParts[2];
    const state = pathParts[3] ? decodeURIComponent(pathParts[3]) : null;

    const serviceName = serviceId === 'passport' ? 'Passport' :
        serviceId === 'income' ? 'Income Certificate' :
            serviceId === 'domicile' ? 'Domicile Certificate' :
                serviceId === 'driving' ? 'Driving License' :
                    serviceId === 'ration' ? 'Ration Card' :
                        serviceId === 'birth' ? 'Birth Certificate' : null;

    const isHome = location.pathname === '/';

    const handleReset = () => {
        localStorage.removeItem('formitra_form_data');
        localStorage.removeItem('formitra_form_step');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="container">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-semibold text-gray-900">Formitra</span>
                                <span className="text-sm font-medium text-indigo-600">AI</span>
                            </div>
                        </motion.div>

                        {/* Breadcrumb - Desktop */}
                        {!isHome && serviceName && (
                            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="hover:text-gray-900 transition-colors flex items-center gap-1"
                                >
                                    <Home size={14} />
                                    Home
                                </button>
                                <ChevronRight size={14} className="text-gray-400" />
                                <span className="font-medium text-gray-900">{serviceName}</span>
                                {state && (
                                    <>
                                        <ChevronRight size={14} className="text-gray-400" />
                                        <span className="flex items-center gap-1.5 text-gray-600">
                                            <MapPin size={14} />
                                            {state}
                                        </span>
                                    </>
                                )}
                            </nav>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleReset}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isHome 
                                    ? 'btn-primary' 
                                    : 'btn-ghost'
                            }`}
                        >
                            {isHome ? 'Get Started' : 'New Form'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="container py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                    <Sparkles size={16} className="text-white" />
                                </div>
                                <span className="text-lg font-semibold text-gray-900">Formitra AI</span>
                            </div>
                            <p className="text-sm text-gray-600 max-w-md">
                                AI-powered form automation for Indian government services. 
                                Save time, reduce errors, complete applications faster.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>Auto-Fill Forms</li>
                                <li>One-Click Submit</li>
                                <li>36 States Supported</li>
                                <li>Secure & Private</li>
                            </ul>
                        </div>

                        {/* Status */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Status</h4>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-emerald-700 text-xs font-medium">All systems operational</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">© 2026 Formitra AI. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
