import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Edit3, Send, User, FileText, AlertCircle, ShieldCheck, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_DOC_VALIDATION_KEY = 'formitra_document_validation';

export default function ReviewPage() {
    const navigate = useNavigate();
    const { serviceId, state } = useParams();
    const decodedState = decodeURIComponent(state);
    const [formData, setFormData] = useState({});
    const [docValidation, setDocValidation] = useState(null);

    useEffect(() => {
        const savedForm = localStorage.getItem('formitra_form_data');
        let parsedFormData = {};
        if (savedForm) {
            try {
                parsedFormData = JSON.parse(savedForm);
                setFormData(parsedFormData);
            } catch {
                navigate('/');
                return;
            }
        } else {
            navigate('/');
            return;
        }

        const savedValidation = localStorage.getItem(LOCAL_STORAGE_DOC_VALIDATION_KEY);
        if (savedValidation) {
            try {
                setDocValidation(JSON.parse(savedValidation));
            } catch {
                // if parsing fails, we simply ignore document validation for this session
                setDocValidation(null);
            }
        }

        // Zero-Click Auto-Sync to Extension
        let files = [];
        try {
            const raw = localStorage.getItem('formitra_files');
            if (raw) files = JSON.parse(raw);
        } catch(e) {}

        const payload = {
            service: serviceId,
            state: decodedState,
            data: parsedFormData,
            files: files
        };

        // Broadcast to extension content script immediately
        window.postMessage({
            type: 'FORMITRA_SAVE_DATA',
            payload: payload
        }, '*');

        // Also save to standard localStorage for the popup to read if content.js messaging missed it
        localStorage.setItem('formitra_app_data', JSON.stringify(payload));
        
    }, [navigate, serviceId, decodedState]);

    const handleBack = () => {
        // After reviewing, users should return to the Application Form step
        // where they can edit the auto-filled data.
        navigate(`/apply/${serviceId}/${encodeURIComponent(decodedState)}/form`);
    };

    const handleSubmit = () => {
        // Data is already synced via the zero-click useEffect hook!
        // Move directly to the Success page which guides the user.
        navigate('/apply/success');
    };

    const personalFields = ['firstName', 'lastName', 'fatherName', 'email', 'mobile', 'dob', 'gender', 'maritalStatus'];
    const addressFields = ['address', 'city', 'pincode', 'state'];
    const passportFields = ['passportType', 'occupation', 'oldPassportNumber'];

    const formatLabel = (key) => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    const Section = ({ title, icon: Icon, fields }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                <Icon size={18} className="text-[#1978E5]" />
                {title}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((key) => (
                    <div
                        key={key}
                        className={`p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm transition-colors hover:border-[#1978E5]/30 ${key === 'address' || key === 'email' ? 'md:col-span-2 lg:col-span-3' : ''
                            }`}
                    >
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 font-bold">{formatLabel(key)}</p>
                        <p className="text-slate-900 font-bold text-[15px] wrap-break-word">
                            {formData[key] || '—'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafbfc] pb-24">
            {/* Minimalist Top Banner */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="container py-4 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#1978E5] transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} />
                        Back to Edit Data
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                        <span>{decodedState}</span>
                        <ChevronRight size={12} />
                        <span className="text-[#1978E5]">Final Review</span>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-8"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                Final Verification
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">
                                Please review your intelligence package before proceeding.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50/50 border border-[#1978E5]/20 shadow-sm">
                            <MapPin size={18} className="text-[#1978E5]" />
                            <span className="font-bold text-[#1978E5] text-sm uppercase tracking-wider">{decodedState}</span>
                        </div>
                    </div>

                    {/* Data Card */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-soft border border-slate-200 space-y-10">
                        
                        {docValidation && docValidation.status === 'success' && (
                            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex items-start gap-4 mb-6">
                                <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={28} strokeWidth={2.5} />
                                <div>
                                    <h3 className="font-extrabold text-emerald-950 text-xl tracking-tight mb-1">AI Extraction Validated</h3>
                                    <p className="text-sm text-emerald-800 leading-relaxed font-semibold">
                                        {docValidation.message || "Your identity details were successfully extracted from the uploaded documents and pre-filled into this application. Verify they are correct below."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-10">
                            <Section title="Personal Information" icon={User} fields={personalFields} />
                            <Section title="Address Details" icon={MapPin} fields={addressFields} />
                            <Section title="Passport Details" icon={FileText} fields={passportFields} />
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleBack}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex-1 sm:flex-none"
                        >
                            <Edit3 size={18} />
                            Edit Details
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#1978E5] hover:bg-[#1461bd] text-white font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20 flex-1"
                        >
                            <Send size={18} />
                            Proceed to Formal Application
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-5 bg-blue-50/50 border border-[#1978E5]/20 rounded-xl flex items-start gap-4 mt-6">
                        <div className="w-10 h-10 rounded-full bg-[#1978E5]/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={22} className="text-[#1978E5]" />
                        </div>
                        <div className="text-sm text-slate-700">
                            <p className="font-bold text-slate-900 mb-1 text-base">Pre-submission intelligence check</p>
                            <p className="font-medium leading-relaxed">
                                Formitra organizes your data and structures it for the government portal, but does not perform official validation. Please ensure all data actively printed above exactly matches your official documents before submitting on the portal.
                            </p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
