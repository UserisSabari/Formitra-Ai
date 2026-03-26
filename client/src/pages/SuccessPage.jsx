import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, ArrowRight, Smartphone, Key, Sparkles, Rocket, ShieldCheck, AlertTriangle } from 'lucide-react';
import ValidationSummaryPanel from '../components/ValidationSummaryPanel';

const LOCAL_STORAGE_DOC_VALIDATION_KEY = 'formitra_document_validation';

function deriveOverallRiskFromGemini(docValidation) {
    if (!docValidation) return null;

    const packageStatus = String(docValidation.packageStatus || '').toLowerCase();
    const breakdown = Array.isArray(docValidation.documentBreakdown) ? docValidation.documentBreakdown : [];

    const errorDocs = breakdown.filter(d => d?.status === 'Error').length;
    const warningDocs = breakdown.filter(d => d?.status === 'Warning').length;
    const issueCount = breakdown.reduce((acc, d) => acc + (Array.isArray(d?.issues) ? d.issues.length : 0), 0);

    let level = 'low';
    if (packageStatus.includes('high')) level = 'high';
    else if (packageStatus.includes('warning')) level = 'medium';
    else if (packageStatus.includes('valid')) level = 'low';
    else if (errorDocs > 0) level = 'high';
    else if (warningDocs > 0 || issueCount > 0) level = 'medium';

    let score = level === 'high' ? 80 : level === 'medium' ? 50 : 20;
    score = Math.min(100, score + Math.min(20, errorDocs * 10 + warningDocs * 5 + issueCount * 2));

    const reasons = [];
    if (docValidation.collectiveInsights) reasons.push(docValidation.collectiveInsights);
    if (errorDocs > 0) reasons.push(`${errorDocs} document(s) flagged as Error`);
    if (warningDocs > 0) reasons.push(`${warningDocs} document(s) flagged as Warning`);
    if (issueCount > 0) reasons.push(`${issueCount} total issue(s) detected across documents`);

    return { score, level, reasons: reasons.slice(0, 4) };
}

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
        navigate('/dashboard');
    };

    const handleSimulateExtensionInstall = () => {
        localStorage.setItem('formitra_extension_installed', 'true');
        setHasExtension(true);
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] py-12 pb-24 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-2xl mx-auto text-center space-y-8 px-4"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="w-24 h-24 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto shadow-sm"
                >
                    <CheckCircle2 size={56} className="text-emerald-500" strokeWidth={2.5} />
                </motion.div>

                {/* Title */}
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Clearance Granted
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                        Your intelligence package has successfully cleared automated baseline validation protocols.
                    </p>
                </div>

                {/* Countdown or Guide */}
                {!showGuide ? (
                    <div className="bg-white p-12 rounded-3xl shadow-soft border border-slate-200">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#1978E5] to-purple-600 mb-6 font-mono tracking-tighter">
                            {count}
                        </div>
                        <p className="text-slate-500 mb-8 font-medium text-lg">Finalizing and encrypting your packet transmission...</p>
                        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner relative">
                            <motion.div 
                                className="absolute inset-y-0 left-0 bg-linear-to-r from-[#1978E5] to-purple-500" 
                                initial={{ width: '100%' }} 
                                animate={{ width: `${(count / 3) * 100}%` }} 
                                transition={{ ease: "linear" }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-soft border border-slate-200 space-y-8">
                        <div className="flex items-center justify-center gap-3 border-b border-slate-100 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#1978E5]/10 border border-[#1978E5]/20 flex items-center justify-center shadow-inner">
                                <ShieldCheck size={24} className="text-[#1978E5]" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mission Briefing</h3>
                        </div>

                        {docValidation && (
                            <ValidationSummaryPanel
                                overallRisk={deriveOverallRiskFromGemini(docValidation)}
                                compact={false}
                            />
                        )}

                        <div className="rounded-2xl bg-blue-50/50 border border-[#1978E5]/20 p-5 text-left text-sm text-slate-700 space-y-2">
                            <p className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                <AlertTriangle size={18} className="text-[#1978E5]" /> Operating Parameters
                            </p>
                            <p className="font-medium leading-relaxed">
                                Formitra securely stages your exact identity variables to accelerate government ingestion workflows. <strong className="font-bold text-slate-900">We do not bypass OTPs, Captchas, or submit anything.</strong>
                            </p>
                            <p className="font-medium leading-relaxed text-[#1978E5]">
                                Final submission is your sole responsibility.
                            </p>
                        </div>

                        <div className="space-y-3 text-left">
                            {[
                                { icon: Rocket, text: 'Deploy to the external target portal instance.', color: '#1978E5' },
                                { icon: Smartphone, text: 'Locate the Formitra Chrome Node located in your top-right browser extensions.', color: '#8b5cf6' },
                                { icon: Sparkles, text: hasExtension ? 'Execute the node to auto-inject your package into the portal structure.' : 'Since the node is missing, perform manual transcription of the variables.', color: '#10b981' },
                                { icon: Key, text: 'Resolve target security gates (OTP/Captcha) manually.', color: '#f59e0b' }
                            ].map((step, i) => {
                                const StepIcon = step.icon;
                                return (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -20 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                                    >
                                        <div 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white border border-slate-100" 
                                        >
                                            <StepIcon size={20} style={{ color: step.color }} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-slate-800 font-bold">{step.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/mock-portal')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#1978E5] hover:bg-[#1461bd] text-white font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20 flex-1"
                            >
                                <Rocket size={18} />
                                Launch Target Portal
                                <ExternalLink size={16} />
                            </button>
                            {!hasExtension && (
                                <button
                                    type="button"
                                    onClick={handleSimulateExtensionInstall}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex-1"
                                >
                                    Activate Demo Extension
                                    <Smartphone size={18} />
                                </button>
                            )}
                            <button 
                                onClick={handleComplete}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                            >
                                Return
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
