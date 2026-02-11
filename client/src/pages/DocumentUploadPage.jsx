import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, ArrowRight, AlertTriangle, FileText } from 'lucide-react';
import DocumentCard from '../components/documents/DocumentCard';
import { DOCUMENT_RULES } from '../config/documentRules';
import { validateSingleDocument, computeRejectionRiskScore } from '../utils/documentValidation';

const LOCAL_STORAGE_FORM_KEY = 'formitra_form_data';
const LOCAL_STORAGE_DOC_VALIDATION_KEY = 'formitra_document_validation';

export default function DocumentUploadPage() {
    const navigate = useNavigate();
    const { serviceId, state } = useParams();
    const decodedState = decodeURIComponent(state);

    const [formData, setFormData] = useState(null);
    const [documents, setDocuments] = useState({
        passportPhoto: { file: null, status: 'missing', issues: [] },
        addressProof: { file: null, status: 'missing', issues: [] },
        dobProof: { file: null, status: 'missing', issues: [] },
        identityProof: { file: null, status: 'missing', issues: [] },
    });
    const [validationResults, setValidationResults] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_FORM_KEY);
        if (!saved) {
            navigate('/');
            return;
        }
        try {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
        } catch {
            navigate('/');
        }
    }, [navigate]);

    const handleBackToForm = () => {
        navigate(`/form/${serviceId}/${encodeURIComponent(decodedState)}?step=2`);
    };

    const handleFileChange = (key) => (file) => {
        setDocuments((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                file,
                status: file ? 'uploaded' : 'missing',
                issues: [],
            },
        }));
        setValidationResults(null);
    };

    const runValidation = async () => {
        if (!formData) return;
        setIsValidating(true);

        try {
            const perDocResults = {};

            for (const key of Object.keys(DOCUMENT_RULES)) {
                const file = documents[key]?.file || null;
                // We only pass a subset of applicant data currently used in comparisons
                const applicantDataSubset = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dob: formData.dob,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                };

                perDocResults[key] = await validateSingleDocument({
                    key,
                    file,
                    applicantData: applicantDataSubset,
                });
            }

            const overallRisk = computeRejectionRiskScore(perDocResults);

            const snapshot = {
                perDocument: perDocResults,
                overallRisk,
                generatedAt: new Date().toISOString(),
            };

            localStorage.setItem(
                LOCAL_STORAGE_DOC_VALIDATION_KEY,
                JSON.stringify(snapshot)
            );

            setValidationResults(snapshot);

            // Also fold high-level status back into local state for UI badges
            setDocuments((prev) => {
                const updated = { ...prev };
                Object.entries(perDocResults).forEach(([key, result]) => {
                    if (!updated[key]) return;
                    const allIssues = [
                        ...(result.basicIssues || []),
                        ...(result.qualityIssues || []),
                        ...(result.consistencyIssues || []),
                    ];
                    updated[key] = {
                        ...updated[key],
                        status: result.status,
                        issues: allIssues,
                    };
                });
                return updated;
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleContinueToReview = async () => {
        await runValidation();
        navigate(`/review/${serviceId}/${encodeURIComponent(decodedState)}`);
    };

    const currentRisk = validationResults?.overallRisk;

    const riskLabel =
        currentRisk?.level === 'high'
            ? 'High rejection risk (review strongly recommended)'
            : currentRisk?.level === 'medium'
            ? 'Medium rejection risk (review suggested)'
            : currentRisk?.level === 'low'
            ? 'Low rejection risk (no guarantee of approval)'
            : 'No risk estimate yet';

    const riskColorClass =
        currentRisk?.level === 'high'
            ? 'bg-red-50 border-red-200 text-red-900'
            : currentRisk?.level === 'medium'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : currentRisk?.level === 'low'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-gray-50 border-gray-200 text-gray-800';

    return (
        <div className="container py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <button
                            onClick={handleBackToForm}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm mb-3"
                        >
                            <ArrowLeft size={16} />
                            Back to Application Form
                        </button>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Upload Supporting Documents
                        </h1>
                        <p className="text-gray-600 max-w-2xl text-sm md:text-base">
                            Upload your passport photograph and address proof so that
                            Formitra can run basic pre-submission checks. This assists
                            you in catching obvious issues before you visit the official
                            portal.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                        <ShieldCheck size={18} className="text-indigo-600" />
                        <span className="text-xs md:text-sm font-medium text-gray-900">
                            State: {decodedState}
                        </span>
                    </div>
                </div>

                <div className="card p-5 md:p-8 space-y-6">
                    <p className="text-xs md:text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>This is a pre-submission validation, not official verification.</strong>{' '}
                            Results here are advisory only. The passport office and the
                            official portal make the final decision on whether your
                            documents are acceptable.
                        </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DocumentCard
                            title="Passport Photograph"
                            subtitle="Front-facing, plain background, as per official guidelines."
                            description="JPG or PNG format. We perform basic checks on size, dimensions, aspect ratio, and approximate clarity."
                            accept="image/jpeg,image/png"
                            required={DOCUMENT_RULES.passportPhoto.required}
                            file={documents.passportPhoto.file}
                            onFileChange={handleFileChange('passportPhoto')}
                            status={documents.passportPhoto.status}
                            issues={documents.passportPhoto.issues}
                        />
                        <DocumentCard
                            title="Address Proof"
                            subtitle="Aadhaar, Voter ID, Electricity Bill, Bank Passbook, etc."
                            description="PDF or image format. We check file size and attempt a basic consistency check against the address you entered."
                            accept="application/pdf,image/jpeg,image/png"
                            required={DOCUMENT_RULES.addressProof.required}
                            file={documents.addressProof.file}
                            onFileChange={handleFileChange('addressProof')}
                            status={documents.addressProof.status}
                            issues={documents.addressProof.issues}
                        />
                        <DocumentCard
                            title="Date of Birth Proof (Optional)"
                            subtitle="Birth certificate, school leaving certificate, etc."
                            description="Optional, but recommended. Only basic format and size checks are performed."
                            accept="application/pdf,image/jpeg,image/png"
                            required={DOCUMENT_RULES.dobProof.required}
                            file={documents.dobProof.file}
                            onFileChange={handleFileChange('dobProof')}
                            status={documents.dobProof.status}
                            issues={documents.dobProof.issues}
                        />
                        <DocumentCard
                            title="Identity Proof (Optional)"
                            subtitle="PAN card, Aadhaar, Voter ID, etc."
                            description="Optional secondary identity proof. Used only for experimental consistency checks with your name."
                            accept="application/pdf,image/jpeg,image/png"
                            required={DOCUMENT_RULES.identityProof.required}
                            file={documents.identityProof.file}
                            onFileChange={handleFileChange('identityProof')}
                            status={documents.identityProof.status}
                            issues={documents.identityProof.issues}
                        />
                    </div>

                    <div className={`mt-4 rounded-xl border p-4 md:p-5 ${riskColorClass}`}>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold mb-1">
                                    Rejection risk estimate
                                </p>
                                <p className="text-xs md:text-sm mb-1">
                                    {riskLabel}
                                </p>
                                {currentRisk && (
                                    <p className="text-[11px] opacity-80">
                                        Score: {currentRisk.score} / 100. This is a heuristic
                                        score based on file format, image quality, and
                                        basic consistency checks – it is <strong>not</strong>{' '}
                                        an official decision.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button
                            type="button"
                            onClick={runValidation}
                            className="btn-secondary flex-1 sm:flex-none sm:w-48"
                            disabled={isValidating}
                        >
                            {isValidating ? 'Running checks…' : 'Run Validation Only'}
                        </button>
                        <button
                            type="button"
                            onClick={handleContinueToReview}
                            className="btn-primary flex-1"
                            disabled={isValidating}
                        >
                            Continue to Review
                            <ArrowRight size={18} className="ml-2" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

