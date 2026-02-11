import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, ArrowRight, Smartphone, Key, Sparkles, Rocket, ShieldCheck } from 'lucide-react';
import ValidationSummaryPanel from '../components/ValidationSummaryPanel';

const LOCAL_STORAGE_DOC_VALIDATION_KEY = 'formitra_document_validation';

export default function SuccessPage() {
    const navigate = useNavigate();
    const [count, setCount] = useState(3);
    const [showGuide, setShowGuide] = useState(false);
    const [docValidation, setDocValidation] = useState(null);
    const [hasExtension, setHasExtension] = useState(false);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowGuide(true);
        }
    }, [count]);

    useEffect(() => {
        const savedValidation = localStorage.getItem(LOCAL_STORAGE_DOC_VALIDATION_KEY);
        if (savedValidation) {
            try {
                setDocValidation(JSON.parse(savedValidation));
            } catch {
                setDocValidation(null);
            }
        }

        const extensionFlag = localStorage.getItem('formitra_extension_installed') === 'true';
        setHasExtension(extensionFlag);
    }, []);

    const handleComplete = () => {
        localStorage.removeItem('formitra_form_data');
        localStorage.removeItem('formitra_form_step');
        localStorage.removeItem(LOCAL_STORAGE_DOC_VALIDATION_KEY);
        navigate('/');
    };

    const handleSimulateExtensionInstall = () => {
        localStorage.setItem('formitra_extension_installed', 'true');
        setHasExtension(true);
    };

    return (
        <div className="container py-12">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="max-w-2xl mx-auto text-center space-y-8"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto"
                >
                    <CheckCircle2 size={48} className="text-emerald-600" />
                </motion.div>

                {/* Title */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Pre-submission checks completed
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your application data and supporting documents have been reviewed with basic, assistive checks.
                    </p>
                </div>

                {/* Countdown or Guide */}
                {!showGuide ? (
                    <div className="card p-8">
                        <div className="text-5xl font-bold text-gradient mb-4">{count}</div>
                        <p className="text-gray-600 mb-6">Summarising your validation results...</p>
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" 
                                initial={{ width: '100%' }} 
                                animate={{ width: `${(count / 3) * 100}%` }} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="card p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                                <ShieldCheck size={20} className="text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Summary & Next Steps</h3>
                        </div>

                        {docValidation && (
                            <ValidationSummaryPanel
                                overallRisk={docValidation.overallRisk}
                                compact={false}
                            />
                        )}

                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-left text-sm text-blue-900 space-y-1.5">
                            <p className="font-semibold">Academic and ethical scope</p>
                            <p>
                                Formitra assists you by checking for obvious issues in your data and documents. It does
                                not bypass OTP, CAPTCHA, or any security controls, and it never submits forms on your behalf.
                            </p>
                            <p>
                                Always verify your details and documents carefully on the official Passport Seva portal before final submission.
                            </p>
                        </div>

                        <div className="space-y-3 text-left">
                            {[
                                { icon: Rocket, text: 'Open the official Passport Seva portal in your browser', color: '#4f46e5' },
                                { icon: Smartphone, text: 'If you have the Formitra helper extension installed, open it on the portal page', color: '#7c3aed' },
                                { icon: Sparkles, text: hasExtension ? 'Use the extension to assist with filling fields (no auto-submission)' : 'Manually enter details carefully, referring to this Formitra summary', color: '#059669' },
                                { icon: Key, text: 'Enter OTP and complete all security steps directly on the official portal', color: '#f59e0b' }
                            ].map((step, i) => {
                                const StepIcon = step.icon;
                                return (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
                                    >
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                                            style={{ backgroundColor: `${step.color}15` }}
                                        >
                                            <StepIcon size={18} style={{ color: step.color }} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{step.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <a 
                                href="https://www.passportindia.gov.in/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary flex-1"
                            >
                                <Rocket size={18} />
                                Open Official Portal
                                <ExternalLink size={16} />
                            </a>
                            {!hasExtension && (
                                <button
                                    type="button"
                                    onClick={handleSimulateExtensionInstall}
                                    className="btn-secondary flex-1"
                                >
                                    Simulate Extension Installed (demo)
                                    <Smartphone size={18} />
                                </button>
                            )}
                            <button 
                                onClick={handleComplete}
                                className="btn-secondary flex-1"
                            >
                                New Application
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
