import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Bell, FileText, Home, Car, Baby, Wallet, Shield, Sparkles, Check } from 'lucide-react';

const serviceInfo = {
    passport: { name: 'Passport Services', icon: Shield, color: '#4f46e5' },
    income: { name: 'Income Certificate', icon: FileText, color: '#059669' },
    domicile: { name: 'Domicile Certificate', icon: Home, color: '#7c3aed' },
    driving: { name: 'Driving License', icon: Car, color: '#ea580c' },
    ration: { name: 'Ration Card', icon: Wallet, color: '#ca8a04' },
    birth: { name: 'Birth Certificate', icon: Baby, color: '#db2777' }
};

export default function ComingSoonPage() {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const service = serviceInfo[serviceId] || { name: 'Service', icon: Clock, color: '#6b7280' };
    const ServiceIcon = service.icon;

    return (
        <div className="container py-12">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="max-w-2xl mx-auto text-center space-y-8"
            >
                {/* Icon */}
                <div className="relative inline-block">
                    <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border" 
                        style={{ 
                            backgroundColor: `${service.color}15`,
                            borderColor: `${service.color}30`
                        }}
                    >
                        <ServiceIcon size={44} style={{ color: service.color }} />
                    </div>
                    <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                        <span className="text-xs font-semibold text-amber-700">Soon</span>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {service.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                        We're working hard to bring you this service
                    </p>
                </div>

                {/* Features */}
                <div className="card p-6 md:p-8 space-y-5">
                    <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-semibold">
                        <Sparkles size={18} />
                        What's Coming
                    </div>
                    <ul className="space-y-3 text-left">
                        {[
                            `Full support for ${service.name}`,
                            'Service-specific smart forms',
                            'One-click auto-fill & submission',
                            'Regional customization'
                        ].map((feature, i) => (
                            <li 
                                key={i} 
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200"
                            >
                                <div 
                                    className="w-2 h-2 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: service.color }}
                                ></div>
                                <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn-primary flex-1"
                    >
                        <ArrowLeft size={18} />
                        Back to Services
                    </button>
                    <button className="btn-secondary flex-1">
                        <Bell size={18} />
                        Notify Me
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
