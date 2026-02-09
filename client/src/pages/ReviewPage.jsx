import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Edit3, Send, User, FileText, ArrowLeft } from 'lucide-react';

export default function ReviewPage() {
    const navigate = useNavigate();
    const { serviceId, state } = useParams();
    const decodedState = decodeURIComponent(state);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const saved = localStorage.getItem('formitra_form_data');
        if (saved) {
            try { 
                setFormData(JSON.parse(saved)); 
            } catch { 
                navigate('/'); 
            }
        } else { 
            navigate('/'); 
        }
    }, [navigate]);

    const handleBack = () => {
        navigate(`/form/${serviceId}/${encodeURIComponent(decodedState)}?step=2`);
    };

    const handleSubmit = () => {
        // Send data to extension
        if (window.chrome?.runtime) {
            window.postMessage({
                type: 'FORMITRA_SAVE_DATA',
                payload: {
                    service: serviceId,
                    state: decodedState,
                    data: formData
                }
            }, '*');
        }
        
        // Store in localStorage as backup
        localStorage.setItem('formitra_app_data', JSON.stringify({
            service: serviceId,
            state: decodedState,
            data: formData
        }));

        navigate('/success');
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
                        className={`p-4 rounded-lg bg-gray-50 border border-gray-200 ${
                            key === 'address' || key === 'email' ? 'md:col-span-2 lg:col-span-3' : ''
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
                <div className="card p-6 md:p-8">
                    <div className="space-y-8">
                        <Section title="Personal Information" icon={User} fields={personalFields} />
                        <div className="divider"></div>
                        <Section title="Address Details" icon={MapPin} fields={addressFields} />
                        <div className="divider"></div>
                        <Section title="Passport Details" icon={FileText} fields={passportFields} />
                    </div>
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
                            <p className="font-medium mb-1">Ready to auto-fill</p>
                            <p className="text-blue-700">
                                After clicking "Proceed to Portal", open the government portal and use the extension to auto-fill your form.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
