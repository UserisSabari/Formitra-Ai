import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, User, MapPin, FileText, Check } from 'lucide-react';
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

        // When all applicant data steps are complete, move to the
        // dedicated Document Upload step before final review.
        navigate(`/upload/${serviceId}/${encodeURIComponent(decodedState)}`);
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setSearchParams({ step: (currentStep - 1).toString() });
        } else {
            navigate(`/select-state/${serviceId}`);
        }
    };

    const step = PASSPORT_FORM_STEPS[currentStep];
    const StepIcon = stepIcons[step.id] || FileText;

    return (
        <div className="container py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm mb-4"
                    >
                        <ArrowLeft size={16} />
                        {currentStep === 0 ? 'Back to State Selection' : 'Previous Step'}
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{step.title}</h1>
                            <p className="text-gray-600">
                                Step {currentStep + 1} of {PASSPORT_FORM_STEPS.length}
                            </p>
                        </div>

                        {/* Step Progress */}
                        <div className="flex items-center gap-2">
                            {PASSPORT_FORM_STEPS.map((s, i) => {
                                const Icon = stepIcons[s.id] || FileText;
                                const isCompleted = i < currentStep;
                                const isCurrent = i === currentStep;
                                return (
                                    <div key={s.id} className="flex items-center">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-indigo-600 text-white'
                                                : isCurrent
                                                    ? 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isCompleted ? (
                                                <Check size={18} />
                                            ) : (
                                                <Icon size={18} />
                                            )}
                                        </div>
                                        {i < PASSPORT_FORM_STEPS.length - 1 && (
                                            <div className={`w-6 h-0.5 mx-1 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="card p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handlePrev}
                        className="btn-secondary flex-1 md:flex-none md:w-40"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn-primary flex-1"
                    >
                        {currentStep === PASSPORT_FORM_STEPS.length - 1 ? 'Review Application' : 'Continue'}
                        <ArrowRight size={18} />
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Your progress is saved automatically
                </p>
            </motion.div>
        </div>
    );
}
