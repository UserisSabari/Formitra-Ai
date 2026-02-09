import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, ArrowRight, Smartphone, Key, Sparkles, Rocket, Check } from 'lucide-react';

export default function SuccessPage() {
    const navigate = useNavigate();
    const [count, setCount] = useState(3);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        if (count > 0) {
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setShowGuide(true);
        }
    }, [count]);

    const handleComplete = () => {
        localStorage.removeItem('formitra_form_data');
        localStorage.removeItem('formitra_form_step');
        navigate('/');
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
                        Data Ready for Auto-Fill!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Open the portal and our extension will handle the rest
                    </p>
                </div>

                {/* Countdown or Guide */}
                {!showGuide ? (
                    <div className="card p-8">
                        <div className="text-5xl font-bold text-gradient mb-4">{count}</div>
                        <p className="text-gray-600 mb-6">Preparing your autofill...</p>
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
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                                <Key size={20} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
                        </div>

                        <div className="space-y-3 text-left">
                            {[
                                { icon: Rocket, text: 'Open the government portal', color: '#4f46e5' },
                                { icon: Smartphone, text: 'Click the extension icon', color: '#7c3aed' },
                                { icon: Sparkles, text: 'Click "Fill Application"', color: '#059669' },
                                { icon: Key, text: 'Enter OTP when prompted', color: '#f59e0b' }
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
                                Open Portal
                                <ExternalLink size={16} />
                            </a>
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
