import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Bell, FileText, Home, Car, Baby, Wallet, Shield, Sparkles, Navigation } from 'lucide-react';

const serviceInfo = {
    passport: { name: 'Passport Services', icon: Shield, color: '#1978E5' },
    income: { name: 'Income Certificate', icon: FileText, color: '#059669' },
    domicile: { name: 'Domicile Certificate', icon: Home, color: '#7c3aed' },
    driving: { name: 'Driving License', icon: Car, color: '#ea580c' },
    ration: { name: 'Ration Card', icon: Wallet, color: '#ca8a04' },
    birth: { name: 'Birth Certificate', icon: Baby, color: '#db2777' }
};

export default function ComingSoonPage() {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const service = serviceInfo[serviceId] || { name: 'Service', icon: Clock, color: '#64748b' };
    const ServiceIcon = service.icon;

    return (
        <div className="min-h-screen bg-[#fafbfc] pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-slate-100 to-transparent pointer-events-none"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-2xl mx-auto text-center space-y-10 px-4 relative z-10"
            >
                {/* Icon Container */}
                <div className="relative inline-block">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto shadow-sm bg-white border-2" 
                        style={{ borderColor: `${service.color}20` }}
                    >
                        <ServiceIcon size={56} style={{ color: service.color }} strokeWidth={1.5} />
                    </motion.div>
                    <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute -top-3 -right-3 px-4 py-1.5 rounded-full bg-slate-900 border-2 border-white shadow-md transform rotate-6"
                    >
                        <span className="text-xs font-bold text-white tracking-widest uppercase">Soon</span>
                    </motion.div>
                </div>

                {/* Title */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                        {service.name}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        We are fundamentally re-engineering the intelligence framework for this jurisdiction.
                    </p>
                </div>

                {/* Features Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-slate-200 text-left space-y-6"
                >
                    <div className="flex items-center gap-3 text-[#1978E5] border-b border-slate-100 pb-4">
                        <Sparkles size={20} />
                        <span className="font-extrabold tracking-wide uppercase text-sm">Deployment Roadmap</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            `Full support for ${service.name}`,
                            'Service-specific document intelligence',
                            'Automated zero-click DOM injection',
                            'Regional constraint verification'
                        ].map((feature, i) => (
                            <li 
                                key={i} 
                                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-300"
                            >
                                <div 
                                    className="w-2 h-2 rounded-full shrink-0 mt-2" 
                                    style={{ backgroundColor: service.color }}
                                ></div>
                                <span className="text-slate-700 font-bold text-sm leading-relaxed">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Back to Core Services
                    </button>
                    <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#1978E5] hover:bg-[#1461bd] text-white font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20">
                        <Bell size={18} />
                        Alert on Launch
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
