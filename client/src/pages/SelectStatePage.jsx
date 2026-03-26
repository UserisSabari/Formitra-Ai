import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ArrowLeft, ArrowRight, AlertTriangle, ChevronRight, Globe2 } from 'lucide-react';
import { INDIAN_STATES } from '../constants';

export default function SelectStatePage() {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStates = INDIAN_STATES.filter(state =>
        state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStateSelect = (state) => {
        // Redirect to Document Upload first to enable Reverse AI Data Extraction
        navigate(`/apply/${serviceId}/${encodeURIComponent(state)}/documents`);
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] pb-24">
            {/* Minimalist Top Banner */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="container py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#1978E5] transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} />
                        Back to Services
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                        <span className="capitalize">{serviceId.replace('-', ' ')}</span>
                        <ChevronRight size={12} />
                        <span className="text-[#1978E5]">Select State</span>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-10"
                >
                    {/* Header Section */}
                    <div className="text-center space-y-4 mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-[#1978E5] rounded-full mb-4 ring-4 ring-white shadow-sm">
                            <Globe2 size={32} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Select Your Jurisdiction
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium">
                            Choose your state of residence to accurately determine the localized prerequisites and processing times for your selected service.
                        </p>
                    </div>

                    {/* Highly Interactive Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-slate-400 group-focus-within:text-[#1978E5] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your constitutional state..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-14 pr-6 py-4.5 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#1978E5]/20 focus:border-[#1978E5] transition-all shadow-sm font-medium"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            {searchTerm && (
                                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">
                                    {filteredStates.length} Results
                                </span>
                            )}
                        </div>
                    </div>

                    {/* States Application Grid */}
                    <div className="pt-4">
                        {filteredStates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {filteredStates.map((state, index) => (
                                        <motion.button
                                            key={state}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.2) }}
                                            onClick={() => handleStateSelect(state)}
                                            className="group relative bg-white p-5 rounded-xl border border-slate-200 text-left overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-[#1978E5]/30 hover:-translate-y-1"
                                        >
                                            <div className="absolute inset-0 bg-linear-to-br from-[#1978E5]/0 to-[#1978E5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-[#1978E5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1978E5] transition-colors duration-300 shadow-inner">
                                                    <MapPin size={22} className="text-[#1978E5] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                                                </div>
                                                <div className="grow">
                                                    <span className="font-bold text-slate-900 group-hover:text-[#1978E5] transition-colors duration-300 truncate block">
                                                        {state}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        Proceed <ArrowRight size={10} />
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm max-w-2xl mx-auto"
                            >
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                    <AlertTriangle className="text-slate-400" size={36} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Jurisdiction Found</h3>
                                <p className="text-slate-500 text-lg mb-8">
                                    We couldn't locate any Indian state or union territory matching "<span className="font-bold text-slate-700">{searchTerm}</span>".
                                </p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 mx-auto"
                                >
                                    <Search size={16} />
                                    Clear Search Query
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
