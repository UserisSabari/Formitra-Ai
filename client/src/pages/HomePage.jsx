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
        color: 'indigo',
        time: '3 min', 
        status: 'live',
        description: 'Apply for new passport or renewal'
    },
    { 
        id: 'income', 
        name: 'Income Certificate', 
        icon: FileText, 
        color: 'emerald',
        time: '2 min', 
        status: 'soon',
        description: 'Get your income certificate online'
    },
    { 
        id: 'domicile', 
        name: 'Domicile Certificate', 
        icon: Home, 
        color: 'purple',
        time: '2 min', 
        status: 'soon',
        description: 'Apply for domicile certificate'
    },
    { 
        id: 'driving', 
        name: 'Driving License', 
        icon: Car, 
        color: 'orange',
        time: '4 min', 
        status: 'soon',
        description: 'New license or renewal'
    },
    { 
        id: 'ration', 
        name: 'Ration Card', 
        icon: Wallet, 
        color: 'amber',
        time: '3 min', 
        status: 'soon',
        description: 'Apply for ration card'
    },
    { 
        id: 'birth', 
        name: 'Birth Certificate', 
        icon: Baby, 
        color: 'pink',
        time: '3 min', 
        status: 'soon',
        description: 'Get birth certificate online'
    }
];

const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200'
};

export default function HomePage() {
    const navigate = useNavigate();

    const handleServiceSelect = (service) => {
        if (service.status === 'soon') {
            navigate(`/coming-soon/${service.id}`);
        } else {
            navigate(`/select-state/${service.id}`);
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-medium text-indigo-700">AI-Powered Platform</span>
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
                                onClick={() => navigate('/select-state/passport')}
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
                                { value: '2,500+', label: 'Users', icon: TrendingUp },
                                { value: '85%', label: 'Time Saved', icon: Zap },
                                { value: '99.9%', label: 'Accuracy', icon: CheckCircle2 }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="card p-6 text-center"
                                >
                                    <stat.icon className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="container">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full mb-4">
                        <Sparkles size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-700">Available Services</span>
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
                                <div className={`w-14 h-14 rounded-xl ${colorClasses[service.color]} flex items-center justify-center mb-4 border`}>
                                    <ServiceIcon size={24} />
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
                                    <div className="mt-6 flex items-center gap-2 text-indigo-600 font-medium text-sm">
                                        Get Started
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
                <div className="card p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
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
                                        <div className={`w-20 h-20 rounded-2xl ${colorClasses[step.color]} flex items-center justify-center border shadow-sm`}>
                                            <StepIcon size={32} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm">
                                            <span className="text-sm font-bold text-gray-900">{step.num}</span>
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
                        { icon: Zap, title: 'Lightning Fast', desc: 'Complete in 3 minutes', color: 'amber' },
                        { icon: Lock, title: '100% Secure', desc: 'Your data stays safe', color: 'emerald' },
                        { icon: Sparkles, title: 'AI-Powered', desc: 'Smart technology', color: 'indigo' },
                        { icon: CheckCircle2, title: 'Zero Errors', desc: 'Validated forms', color: 'purple' }
                    ].map((feature, i) => {
                        const FeatureIcon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="card p-6 text-center"
                            >
                                <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color]} flex items-center justify-center mx-auto mb-4 border`}>
                                    <FeatureIcon size={20} />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="container">
                <div className="card p-12 md:p-16 text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Sparkles className="w-12 h-12 mx-auto text-white/90" />
                        <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Started?</h2>
                        <p className="text-xl text-indigo-100">
                            Join <span className="font-semibold text-white">2,500+ users</span> who simplified their paperwork
                        </p>

                        <button
                            onClick={() => navigate('/select-state/passport')}
                            className="btn bg-white text-indigo-600 hover:bg-gray-50 px-8 py-3.5 text-base font-semibold shadow-lg"
                        >
                            <Sparkles size={20} />
                            Start Free Now
                            <ArrowRight size={20} />
                        </button>

                        <p className="text-sm text-indigo-200">No credit card • Free forever • 2 min setup</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
