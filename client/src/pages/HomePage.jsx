import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Shield, Car, Baby, Wallet, Home,
    ArrowRight, Zap, Lock, CheckCircle2, Sparkles, Clock, TrendingUp
} from 'lucide-react';

const services = [
    { 
        id: 'passport', 
        name: 'Passport Services', 
        icon: Shield, 
        color: 'mono',
        time: '3 min', 
        status: 'live',
        description: 'Apply for new passport or renewal'
    },
    { 
        id: 'income', 
        name: 'Income Certificate', 
        icon: FileText, 
        color: 'mono',
        time: '2 min', 
        status: 'soon',
        description: 'Get your income certificate online'
    },
    { 
        id: 'domicile', 
        name: 'Domicile Certificate', 
        icon: Home, 
        color: 'mono',
        time: '2 min', 
        status: 'soon',
        description: 'Apply for domicile certificate'
    },
    { 
        id: 'driving', 
        name: 'Driving License', 
        icon: Car, 
        color: 'mono',
        time: '4 min', 
        status: 'soon',
        description: 'New license or renewal'
    },
    { 
        id: 'ration', 
        name: 'Ration Card', 
        icon: Wallet, 
        color: 'mono',
        time: '3 min', 
        status: 'soon',
        description: 'Apply for ration card'
    },
    { 
        id: 'birth', 
        name: 'Birth Certificate', 
        icon: Baby, 
        color: 'mono',
        time: '3 min', 
        status: 'soon',
        description: 'Get birth certificate online'
    }
];

export default function HomePage() {
    const navigate = useNavigate();

    const handleServiceSelect = (service) => {
        if (service.status === 'soon') {
            navigate(`/apply/${service.id}/coming-soon`);
        } else {
            navigate(`/apply/${service.id}/state`);
        }
    };

    return (
        <div className="space-y-20 pb-16">
            {/* Hero Section */}
            <section className="container pt-12 lg:pt-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-md shadow-sm">
                            <span className="text-xs font-bold text-zinc-800 tracking-wide uppercase">Enterprise AI Engine</span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                                Government Forms
                                <br />
                                <span className="text-gradient">Made Simple</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Complete any government form in <span className="font-semibold text-gray-900">under 3 minutes</span> with our intelligent assistant. Fast, accurate, and hassle-free.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/apply/passport/state')}
                                className="btn-primary text-base px-8 py-3.5"
                            >
                                <Sparkles size={20} />
                                Start Free Application
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-secondary text-base px-8 py-3.5">
                                Learn More
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
                            {[
                                { value: 'Free Forever', label: 'Users', icon: TrendingUp },
                                { value: '85%', label: 'Time Saved', icon: Zap },
                                { value: '99.9%', label: 'Accuracy', icon: CheckCircle2 }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="card p-6 text-center border-zinc-200"
                                >
                                    <div className="w-10 h-10 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                                        <stat.icon className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="text-2xl font-bold text-black mb-1 tracking-tight">{stat.value}</div>
                                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-md mb-4">
                        <Shield className="text-slate-700" size={16} />
                        <span className="text-sm font-semibold text-slate-700">Available Integrations</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Choose Your Service</h2>
                    <p className="text-lg text-gray-600">Select any service to get started instantly</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => {
                        const ServiceIcon = service.icon;
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleServiceSelect(service)}
                                className="service-card group"
                            >
                                {/* Status Badge */}
                                {service.status === 'live' && (
                                    <div className="absolute top-4 right-4">
                                        <span className="badge-success text-xs">Live</span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-5`}>
                                    <ServiceIcon size={20} className="text-black" />
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                                    {/* Time Badge */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock size={14} />
                                        <span>~{service.time}</span>
                                    </div>

                                    {/* Coming Soon */}
                                    {service.status === 'soon' && (
                                        <div className="mt-4">
                                            <span className="badge-warning text-xs">Coming Soon</span>
                                        </div>
                                    )}

                                    {/* Arrow */}
                                    <div className="mt-6 flex items-center gap-2 text-slate-800 font-semibold text-sm">
                                        Configure Module
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* How it Works */}
            <section className="container">
                <div className="card p-8 md:p-12 bg-slate-50 border-slate-200">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">How It Works</h2>
                        <p className="text-lg text-gray-600">Three simple steps to complete your application</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { 
                                num: '1', 
                                title: 'Select Service', 
                                desc: 'Choose from 6+ government services', 
                                icon: FileText, 
                                color: 'indigo' 
                            },
                            { 
                                num: '2', 
                                title: 'Fill Smart Form', 
                                desc: 'AI helps you complete faster', 
                                icon: Sparkles, 
                                color: 'purple' 
                            },
                            { 
                                num: '3', 
                                title: 'Auto Submit', 
                                desc: 'We handle the submission', 
                                icon: Zap, 
                                color: 'pink' 
                            }
                        ].map((step, i) => {
                            const StepIcon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="text-center"
                                >
                                    {/* Number Badge */}
                                    <div className="relative inline-block mb-6">
                                        <div className={`w-16 h-16 rounded bg-zinc-50 text-black flex items-center justify-center border border-zinc-200 shadow-sm`}>
                                            <StepIcon size={28} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded bg-black flex items-center justify-center shadow-sm">
                                            <span className="text-sm font-bold text-white">{step.num}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Why Choose Us?</h2>
                    <p className="text-lg text-gray-600">Everything you need for hassle-free forms</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Zap, title: 'Lightning Fast', desc: 'Process applications instantly', color: 'amber' },
                        { icon: Lock, title: '100% Secure', desc: 'Local memory execution', color: 'emerald' },
                        { icon: Shield, title: 'Compliant', desc: 'Auto-adapts to regulations', color: 'slate' },
                        { icon: CheckCircle2, title: 'Zero Errors', desc: 'Pre-validated pipelines', color: 'slate' }
                    ].map((feature, i) => {
                        const FeatureIcon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card p-6 text-center border-zinc-200"
                            >
                                <div className={`w-12 h-12 rounded bg-zinc-50 flex items-center justify-center mx-auto mb-4 border border-zinc-200`}>
                                    <FeatureIcon size={20} className="text-black" />
                                </div>
                                <h4 className="text-lg font-bold text-black mb-2">{feature.title}</h4>
                                <p className="text-sm text-zinc-600">{feature.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="container">
                <div className="card p-12 md:p-16 text-center bg-black border-black text-white rounded">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Shield className="w-12 h-12 mx-auto text-white" />
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to Deploy?</h2>
                        <p className="text-xl text-zinc-400">
                            Join the <span className="font-semibold text-white">enterprise teams</span> accelerating their regulatory pipelines.
                        </p>

                        <button
                            onClick={() => navigate('/apply/passport/state')}
                            className="btn bg-white text-black hover:bg-zinc-200 px-8 py-3.5 text-sm font-bold shadow-soft"
                        >
                            <Zap size={18} className="text-black" />
                            Start Free Now
                            <ArrowRight size={18} />
                        </button>

                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Zero Trust Architecture • Configurable Modules</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
