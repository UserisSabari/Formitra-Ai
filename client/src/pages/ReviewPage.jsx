import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Edit3, Send, User, FileText, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';

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
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <Icon size={16} />
                {title}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((key) => (
                    <div
                        key={key}
                        className={`p-4 rounded-lg bg-gray-50 border border-gray-200 ${key === 'address' || key === 'email' ? 'md:col-span-2 lg:col-span-3' : ''
                            }`}
                    >
                        <p className="text-xs text-gray-500 mb-1.5 font-medium">{formatLabel(key)}</p>
                        <p className="text-gray-900 font-medium text-sm break-words">
                            {formData[key] || '—'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Review Your Application
                        </h1>
                        <p className="text-gray-600">
                            Verify all details before proceeding to the portal
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                        <MapPin size={16} className="text-indigo-600" />
                        <span className="font-medium text-gray-900 text-sm">{decodedState}</span>
                    </div>
                </div>

                {/* Data Card */}
                <div className="card p-6 md:p-8 space-y-8">
                    <div className="space-y-8">
                        <Section title="Personal Information" icon={User} fields={personalFields} />
                        <div className="divider"></div>
                        <Section title="Address Details" icon={MapPin} fields={addressFields} />
                        <div className="divider"></div>
                        <Section title="Passport Details" icon={FileText} fields={passportFields} />
                    </div>

                    {docValidation && (
                        <>
                            <div className="divider"></div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <ShieldCheck size={16} />
                                    AI Document Verification Summary
                                </div>

                                {/* Global Package Health Card from Gemini */}
                                <div className={`p-5 rounded-xl border ${docValidation.packageStatus === 'Valid' ? 'bg-emerald-50 border-emerald-200' : docValidation.packageStatus === 'Error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            {docValidation.packageStatus === 'Valid' ? (
                                                <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={24} />
                                            ) : docValidation.packageStatus === 'Error' ? (
                                                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={24} />
                                            ) : (
                                                <AlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={24} />
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Application Package Health</h3>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${docValidation.packageStatus === 'Valid' ? 'bg-emerald-100 text-emerald-800' : docValidation.packageStatus === 'Error' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                                        {docValidation.packageStatus.toUpperCase()}
                                                    </span>
                                                    {docValidation.overallScore !== undefined && (
                                                        <span className="text-xs font-bold text-gray-600 bg-white/60 px-2 py-0.5 rounded border border-gray-200">
                                                            Score: {docValidation.overallScore}/100
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 p-4 rounded-lg border border-white/60 shadow-sm mt-3">
                                        <p className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wider">
                                            <ShieldCheck size={14} /> Collective AI Analysis
                                        </p>
                                        <p className="text-sm text-gray-800 leading-relaxed font-medium">"{docValidation.collectiveInsights}"</p>
                                    </div>
                                </div>

                                {/* Document Breakdown */}
                                {docValidation.documentBreakdown && docValidation.documentBreakdown.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                        {docValidation.documentBreakdown.map((doc, idx) => (
                                            <div key={idx} className={`p-4 rounded-lg border bg-white ${doc.status === 'Valid' ? 'border-emerald-200 shadow-sm' : doc.status === 'Error' ? 'border-red-300 shadow-sm' : 'border-amber-200 shadow-sm'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {doc.status === 'Valid' ? (
                                                        <CheckCircle className="text-emerald-500 flex-shrink-0" size={16} />
                                                    ) : doc.status === 'Error' ? (
                                                        <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                                                    ) : (
                                                        <AlertCircle className="text-amber-500 flex-shrink-0" size={16} />
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm truncate">{doc.originalFileName || `Document ${idx + 1}`}</p>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase">{doc.inferredDocumentType}</p>
                                                    </div>
                                                </div>

                                                {doc.issues && doc.issues.length > 0 ? (
                                                    <ul className={`mt-2 list-disc list-inside text-xs space-y-0.5 ${doc.status === 'Error' ? 'text-red-700' : 'text-amber-700'}`}>
                                                        {doc.issues.map((issue, i) => (
                                                            <li key={i}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> Document looks perfect.
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleBack}
                        className="btn-secondary flex-1 sm:flex-none sm:w-40"
                    >
                        <Edit3 size={18} />
                        Edit
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-success flex-1"
                    >
                        <Send size={18} />
                        Proceed to Portal
                    </button>
                </div>

                {/* Info Box */}
                <div className="card p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">Pre-submission check only</p>
                            <p className="text-blue-700">
                                Formitra helps you prepare your data and documents, but it does not perform any official
                                verification or submit applications on your behalf. Always review the highlighted points
                                before submitting on the official passport portal.
                            </p>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
