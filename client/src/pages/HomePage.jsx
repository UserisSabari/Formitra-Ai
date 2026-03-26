import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, ArrowRight, Shield, Cpu, Zap, Brain, CheckCircle, Settings,
    FileText, Home, Car, Handshake, Landmark, FileSearch, Wand2,
    Clock, ListChecks, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.5 } }
};

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const services = [
        { id: "passport", title: "Passport Services", desc: "Apply for new passport or renewal.", time: "~3 min", icon: <Shield size={24}/>, active: true },
        { id: "income", title: "Income Certificate", desc: "Get your income certificate online.", time: "~2 min", icon: <FileText size={24}/>, active: false },
        { id: "domicile", title: "Domicile Certificate", desc: "Apply for domicile certificate.", time: "~2 min", icon: <Home size={24}/>, active: false },
        { id: "vehicle", title: "Vehicle Registration", desc: "Register new vehicle or transfer ownership.", time: "~4 min", icon: <Car size={24}/>, active: true },
        { id: "business", title: "Business License", desc: "Apply for new business permits.", time: "~5 min", icon: <Handshake size={24}/>, active: true },
        { id: "property", title: "Property Tax Payment", desc: "Pay your property taxes securely.", time: "~2 min", icon: <Landmark size={24}/>, active: true },
    ];

    return (
        <div className="min-h-screen bg-[#fafbfc] text-[#334155] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-linear-to-b from-[#f8fafc] to-[#f1f5f9] min-h-[600px] flex flex-col justify-center">
                {/* Soft decorative background elements matching image */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e0e7ff] rounded-full blur-[100px] opacity-70 -translate-y-1/2 translate-x-1/4 z-0"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#f1f5f9] rounded-[3rem] rotate-45 blur-md opacity-80 translate-y-1/3 -translate-x-[40%] z-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.05),0_0_50px_rgba(255,255,255,0.5)] border border-white"></div>
                <div className="absolute top-[40%] right-0 w-[500px] h-[700px] bg-[#e2e8f0]/40 rounded-[3rem] blur-xl opacity-80 translate-x-[40%] -translate-y-1/2 z-0 border border-white shadow-[0_0_50px_rgba(255,255,255,0.5)]"></div>

                {/* Floating outline icons matching image exactly */}
                <div className="absolute top-[20%] left-[15%] text-slate-400 opacity-60"><Cpu size={56} strokeWidth={1} /></div>
                <div className="absolute top-[15%] right-[20%] text-slate-400 opacity-60"><CheckCircle size={40} strokeWidth={1} /></div>
                <div className="absolute top-[25%] right-[10%] text-slate-400 opacity-60 flex flex-col"><FileText size={56} strokeWidth={1} /><span className="absolute bottom-1 right-1 text-slate-400 opacity-60"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span></div>
                <div className="absolute top-[45%] right-[15%] text-slate-400 opacity-60"><Brain size={56} strokeWidth={1} /></div>
                <div className="absolute bottom-[20%] left-[10%] text-slate-400 opacity-60"><Shield size={56} strokeWidth={1} /></div>
                <div className="absolute bottom-[25%] left-[20%] text-slate-400 opacity-60"><Settings size={56} strokeWidth={1} /></div>
                <div className="absolute bottom-[10%] left-[30%] text-slate-400 opacity-60"><CheckCircle size={40} strokeWidth={1} /></div>
                <div className="absolute top-[35%] right-[25%] text-slate-400 opacity-60"><Zap size={48} strokeWidth={1} /></div>

                <div className="container max-w-5xl relative z-10 mx-auto px-4 mt-8">
                    <motion.div 
                        variants={containerVariants} initial="hidden" animate="visible"
                        className="text-center flex flex-col items-center"
                    >
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#0f172a] mb-6 leading-[1.15]">
                            Government Forms<br />
                            Made Simple
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
                            Complete any government form in <strong className="text-slate-800">under 3 minutes</strong> with our intelligent assistant. Fast, accurate, and hassle-free.
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#services" className="btn btn-primary flex items-center gap-2 text-base px-8 py-3.5 w-full sm:w-auto shadow-lg shadow-blue-500/20 rounded-md">
                                <Sparkles size={18} /> Start Free Application <ArrowRight size={16} />
                            </a>
                            <a href="#how" className="btn btn-secondary text-base px-8 py-3.5 w-full sm:w-auto rounded-md">
                                Learn More
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Our Services */}
            <section id="services" className="py-24 bg-white">
                <div className="container max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
                        <p className="text-lg text-slate-500">Select any service to get started instantly.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <div key={i} className="pro-card p-8 flex flex-col h-full group hover:border-purple-200 transition-colors">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 grow leading-relaxed">{service.desc}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                        <Clock size={14} /> {service.time}
                                    </span>
                                    {service.active ? (
                                        <Link to={`/apply/${service.id}/state`} className="text-[#1978E5] font-semibold text-sm flex items-center gap-1 hover:text-[#1461bd] transition-colors">
                                            Configure Module <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                        </Link>
                                    ) : (
                                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="py-24 bg-[#fafbfc]">
                <div className="container max-w-5xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
                        <p className="text-lg text-slate-500">Three simple steps to complete your application</p>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center relative gap-12 md:gap-0 max-w-4xl mx-auto">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-slate-200 z-0"></div>
                        
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
                            <div className="w-24 h-24 rounded-full bg-white border border-blue-600 text-blue-600 flex items-center justify-center mb-6 relative">
                                <FileSearch size={32} strokeWidth={1.5} />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-[#fafbfc]">1</div>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Select Service</h4>
                            <p className="text-slate-500 text-sm px-4">Choose from 6+ standardized government services</p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
                            <div className="w-24 h-24 rounded-full bg-white border border-blue-600 text-blue-600 flex items-center justify-center mb-6 relative">
                                <Wand2 size={32} strokeWidth={1.5} />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-[#fafbfc]">2</div>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Fill Smart Form</h4>
                            <p className="text-slate-500 text-sm px-4">AI helps you complete forms faster and flawlessly</p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
                            <div className="w-24 h-24 rounded-full bg-white border border-blue-600 text-blue-600 flex items-center justify-center mb-6 relative">
                                <Zap size={32} strokeWidth={1.5} />
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-[#fafbfc]">3</div>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Auto Submit</h4>
                            <p className="text-slate-500 text-sm px-4">We securely handle the final submission</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 bg-[#fafbfc] border-t border-slate-100">
                <div className="container max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
                        <p className="text-lg text-slate-500">Everything you need for hassle-free forms</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="pro-card p-8 flex flex-col items-center text-center">
                            <Clock size={32} className="text-slate-700 mb-5" strokeWidth={1.5} />
                            <h4 className="font-bold text-slate-900 text-lg mb-2">Lightning Fast</h4>
                            <p className="text-slate-500 text-sm">Process highly complex applications instantly.</p>
                        </div>
                        <div className="pro-card p-8 flex flex-col items-center text-center">
                            <Shield size={32} className="text-slate-700 mb-5" strokeWidth={1.5} />
                            <h4 className="font-bold text-slate-900 text-lg mb-2">100% Secure</h4>
                            <p className="text-slate-500 text-sm">Strict local memory execution. Zero leaks.</p>
                        </div>
                        <div className="pro-card p-8 flex flex-col items-center text-center">
                            <CheckCircle2 size={32} className="text-slate-700 mb-5" strokeWidth={1.5} />
                            <h4 className="font-bold text-slate-900 text-lg mb-2">Compliant</h4>
                            <p className="text-slate-500 text-sm">Auto-adapts and maps to rigid regulations.</p>
                        </div>
                        <div className="pro-card p-8 flex flex-col items-center text-center">
                            <ListChecks size={32} className="text-slate-700 mb-5" strokeWidth={1.5} />
                            <h4 className="font-bold text-slate-900 text-lg mb-2">Zero Errors</h4>
                            <p className="text-slate-500 text-sm">Pre-validated pipelines reject any human error.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
