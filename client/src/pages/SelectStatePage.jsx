import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import { INDIAN_STATES } from '../constants';

export default function SelectStatePage() {
    const navigate = useNavigate();
    const { serviceId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStates = INDIAN_STATES.filter(state =>
        state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStateSelect = (state) => {
        navigate(`/form/${serviceId}/${encodeURIComponent(state)}`);
    };

    return (
        <div className="container py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm mb-4"
                >
                    <ArrowLeft size={16} />
                    Back to Services
                </button>

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Select Your State
                    </h1>
                    <p className="text-lg text-gray-600">
                        Choose your location for region-specific services
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search states..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 pr-4 py-3.5 text-base"
                    />
                </div>

                {/* Results count */}
                {searchTerm && (
                    <p className="text-sm text-gray-500">
                        Showing {filteredStates.length} of {INDIAN_STATES.length} states
                    </p>
                )}

                {/* States Grid */}
                {filteredStates.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredStates.map((state, index) => (
                            <motion.button
                                key={state}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                                onClick={() => handleStateSelect(state)}
                                className="card card-hover p-4 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <MapPin size={18} className="text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{state}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="card p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-600 mb-4">No states found matching "{searchTerm}"</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="btn-ghost text-sm"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
