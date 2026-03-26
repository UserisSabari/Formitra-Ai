import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, MapPin, FileText, Check, ChevronRight } from 'lucide-react';
import { PASSPORT_FORM_STEPS } from '../constants';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const stepIcons = { personal: User, address: MapPin, passport: FileText };

export default function PassportFormPage() {
    const navigate = useNavigate();
    const { serviceId, state } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const decodedState = decodeURIComponent(state);
    const currentStep = parseInt(searchParams.get('step') || '0', 10);

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('formitra_form_data');
        if (saved) {
            try { return JSON.parse(saved); }
            catch { return getInitialFormData(decodedState); }
        }
        return getInitialFormData(decodedState);
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        localStorage.setItem('formitra_form_data', JSON.stringify(formData));
    }, [formData]);

    function getInitialFormData(selectedState) {
        return {
            firstName: '', lastName: '', fatherName: '', email: '', mobile: '',
            dob: '', gender: '', maritalStatus: '', address: '', city: '',
            pincode: '', state: selectedState, passportType: '', occupation: '', oldPassportNumber: ''
        };
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const validateStep = () => {
        const newErrors = {};
        const stepFields = PASSPORT_FORM_STEPS[currentStep].fields;

        stepFields.forEach(field => {
            const value = formData[field.name];

            // Required field check
            if (field.required && !value) {
                newErrors[field.name] = 'This field is required';
            } else if (value) {
                // Specific validation rules
                if (field.name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
                    newErrors[field.name] = 'Please enter a valid email address';
                }
                if (field.name === 'mobile' && !/^\d{10}$/.test(value)) {
                    newErrors[field.name] = 'Mobile number must be 10 digits';
                }
                if (field.name === 'pincode' && !/^\d{6}$/.test(value)) {
                    newErrors[field.name] = 'PIN code must be 6 digits';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        const isLastStep = currentStep >= PASSPORT_FORM_STEPS.length - 1;

        if (!isLastStep) {
            setSearchParams({ step: (currentStep + 1).toString() });
            return;
        }

        // Move to Review application
        navigate(`/apply/${serviceId}/${encodeURIComponent(decodedState)}/review`);
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setSearchParams({ step: (currentStep - 1).toString() });
        } else {
            navigate(`/apply/${serviceId}/${encodeURIComponent(decodedState)}/documents`);
        }
    };

    const step = PASSPORT_FORM_STEPS[currentStep];
    const StepIcon = stepIcons[step.id] || FileText;

    return (
        <div className="min-h-screen bg-[#fafbfc] pb-24">
            {/* Minimalist Top Banner */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="container py-4 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#1978E5] transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} />
                        {currentStep === 0 ? 'Back to Uploads' : 'Previous Section'}
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                        <span>{decodedState}</span>
                        <ChevronRight size={12} />
                        <span className="text-[#1978E5]">Data Entry</span>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header Details */}
                    <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
                                {step.title}
                            </h1>
                            <p className="text-lg text-slate-500 font-medium">
                                Step {currentStep + 1} of {PASSPORT_FORM_STEPS.length} — Please verify all entries
                            </p>
                        </div>

                        {/* Step Progress Container */}
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                            {PASSPORT_FORM_STEPS.map((s, i) => {
                                const Icon = stepIcons[s.id] || FileText;
                                const isCompleted = i < currentStep;
                                const isCurrent = i === currentStep;
                                return (
                                    <div key={s.id} className="flex items-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                                            isCompleted
                                                ? 'bg-[#1978E5] text-white shadow-[#1978E5]/20'
                                                : isCurrent
                                                    ? 'bg-blue-50 border-2 border-[#1978E5] text-[#1978E5] scale-110'
                                                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                                        }`}>
                                            {isCompleted ? <Check size={20} strokeWidth={2.5} /> : <Icon size={20} strokeWidth={isCurrent ? 2.5 : 2} />}
                                        </div>
                                        {i < PASSPORT_FORM_STEPS.length - 1 && (
                                            <div className={`w-8 h-1 mx-2 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-[#1978E5]' : 'bg-slate-100'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Elevated Form Card */}
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-soft border border-slate-200">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
                            >
                                {step.fields.map((field, idx) => (
                                    <motion.div
                                        key={field.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={field.name === 'address' ? 'md:col-span-2' : ''}
                                    >
                                        {field.type === 'select' ? (
                                            <FormSelect
                                                label={field.label}
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                options={field.options}
                                                required={field.required}
                                                error={errors[field.name]}
                                            />
                                        ) : (
                                            <FormInput
                                                label={field.label}
                                                name={field.name}
                                                type={field.type}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                required={field.required}
                                                error={errors[field.name]}
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-10 mt-8 border-t border-slate-100">
                            <button
                                onClick={handlePrev}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1978E5] hover:bg-[#1461bd] text-white font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20 grow"
                            >
                                {currentStep === PASSPORT_FORM_STEPS.length - 1 ? 'Review Final Application' : 'Save & Continue'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mt-6 text-slate-400 font-medium text-sm gap-2">
                        <Check size={14} className="text-emerald-500" />
                        Your progress is auto-saved securely in your browser
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
