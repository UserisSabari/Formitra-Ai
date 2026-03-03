import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, UploadCloud, AlertCircle, CheckCircle, FileText, Info } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { AI_API_BASE_URL } from '../config/api';

const LOCAL_STORAGE_FORM_KEY = 'formitra_form_data';

export default function DocumentUploadPage() {
    const navigate = useNavigate();
    const { serviceId, state } = useParams();
    const decodedState = decodeURIComponent(state);

    const [formData, setFormData] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [aiPackageResult, setAiPackageResult] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleFileSelect = async (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const processedFiles = [];

            for (const file of newFiles) {
                // Only compress images, let PDFs pass through
                if (file.type.startsWith('image/')) {
                    const options = {
                        maxSizeMB: 1,          // Compress to max 1MB
                        maxWidthOrHeight: 1920, // Resize if extremely large
                        useWebWorker: true,
                        fileType: 'image/jpeg'  // Force conversion to standard JPEG for Gemini
                    };
                    try {
                        console.log(`Compressing ${file.name}... Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                        const compressedFile = await imageCompression(file, options);
                        console.log(`Compressed ${file.name} to ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

                        // browser-image-compression returns a Blob, we convert it back to a File object with the original name
                        const finalFile = new File([compressedFile], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        processedFiles.push(finalFile);
                    } catch (error) {
                        console.error('Error compressing image:', error);
                        processedFiles.push(file); // fallback to original if compression fails
                    }
                } else {
                    processedFiles.push(file);
                }
            }

            setSelectedFiles(prev => [...prev, ...processedFiles]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setAiPackageResult(null);
    };

    const handleVerifyWithAI = async () => {
        if (!formData || selectedFiles.length === 0) return;
        setIsVerifying(true);
        setAiPackageResult(null);

        const applicantDataSubset = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dob: formData.dob,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
        };

        try {
            const formParams = new FormData();
            formParams.append('applicantData', JSON.stringify(applicantDataSubset));

            // Append all files to the 'documents' array expected by multer
            selectedFiles.forEach(file => {
                formParams.append('documents', file);
            });

            const response = await fetch(`${AI_API_BASE_URL}/api/verify-document`, {
                method: 'POST',
                body: formParams,
            });

            if (!response.ok) {
                const errorJson = await response.json();
                throw new Error(errorJson.error || `API returned ${response.status}`);
            }

            const json = await response.json();
            setAiPackageResult(json);

        } catch (err) {
            console.error("AI Verification Error:", err);
            setAiPackageResult({
                packageStatus: 'Error',
                overallScore: 0,
                collectiveInsights: err.message || 'Failed to communicate with AI Backend.',
                documentBreakdown: []
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleContinueToReview = () => {
        if (aiPackageResult) {
            localStorage.setItem('formitra_document_validation', JSON.stringify(aiPackageResult));
        } else {
            localStorage.removeItem('formitra_document_validation');
        }
        navigate(`/review/${serviceId}/${encodeURIComponent(decodedState)}`);
    };

    return (
        <div className="container py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <div>
                    <button
                        onClick={handleBackToForm}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm mb-3"
                    >
                        <ArrowLeft size={16} />
                        Back to Application Form
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-3">
                        Smart Document Upload
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                            Powered by Gemini AI
                        </span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl text-sm md:text-base">
                        Upload your supporting documents here. Our Vision AI will automatically analyze them, classify what they are, and cross-reference the data with your application to ensure you won't get rejected.
                    </p>
                </div>

                {/* Document Guidelines Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Info size={20} className="text-blue-500" />
                        Required Documents for Passport Application
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                            <div>
                                <p className="font-semibold text-gray-900">Recent Passport-Sized Photograph <span className="text-red-500">*</span></p>
                                <p className="text-gray-500">Color photo with a plain white or light background.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</span>
                            <div>
                                <p className="font-semibold text-gray-900">Proof of Address <span className="text-red-500">*</span></p>
                                <p className="text-gray-500">E.g., Aadhaar Card, Voter ID, Electricity Bill, or Bank Passbook.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">3</span>
                            <div>
                                <p className="font-semibold text-gray-900">Proof of Date of Birth <span className="text-gray-400 font-normal">(Optional)</span></p>
                                <p className="text-gray-500">E.g., Birth Certificate, PAN Card, or School Leaving Certificate.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">4</span>
                            <div>
                                <p className="font-semibold text-gray-900">Non-ECR Proof <span className="text-gray-400 font-normal">(Optional)</span></p>
                                <p className="text-gray-500">10th Standard Marksheet or higher educational degree.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="card p-8 md:p-12 space-y-8 border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors shadow-none text-center">
                    <div className="mx-auto w-20 h-20 bg-indigo-100/50 rounded-full flex items-center justify-center">
                        <UploadCloud size={40} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-900">Drop your files here</p>
                        <p className="text-sm text-gray-500 mt-1">Accepts JPG, PNG, and PDF up to 5MB each</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <button
                        className="btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Browse Files
                    </button>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-600" />
                            To be analyzed
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 font-bold text-xs uppercase">
                                            {file.name.split('.').pop()}
                                        </div>
                                        <span className="text-sm text-gray-800 truncate font-medium">{file.name}</span>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium px-2">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isVerifying && (
                    <div className="p-10 text-center space-y-4 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"></div>
                        <p className="text-lg text-indigo-900 font-bold">Gemini AI is analyzing your documents...</p>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">Reading text, checking logical consistency, and looking for discrepancies against your application data.</p>
                    </div>
                )}

                {aiPackageResult && !isVerifying && (
                    <div className="space-y-6 pt-4">

                        {/* Global Package Health Card */}
                        <div className={`p-6 rounded-xl border-2 shadow-sm ${aiPackageResult.packageStatus === 'Valid' ? 'bg-emerald-50 border-emerald-400' : aiPackageResult.packageStatus === 'Error' ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-400'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    {aiPackageResult.packageStatus === 'Valid' ? (
                                        <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={32} />
                                    ) : aiPackageResult.packageStatus === 'Error' ? (
                                        <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={32} />
                                    ) : (
                                        <AlertCircle className="text-amber-500 mt-1 flex-shrink-0" size={32} />
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 leading-none">Application Package Health</h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${aiPackageResult.packageStatus === 'Valid' ? 'bg-emerald-200 text-emerald-900' : aiPackageResult.packageStatus === 'Error' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                                                {aiPackageResult.packageStatus.toUpperCase()}
                                            </span>
                                            {aiPackageResult.overallScore !== undefined && (
                                                <span className="text-sm font-bold text-gray-700 bg-white/60 px-2 py-0.5 rounded border border-gray-200">
                                                    Confidence Score: {aiPackageResult.overallScore}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 p-5 rounded-lg border border-white/60 shadow-sm mt-4">
                                <p className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wider">
                                    <ShieldCheck size={16} /> Collective AI Analysis
                                </p>
                                <p className="text-base text-gray-800 leading-relaxed font-medium">"{aiPackageResult.collectiveInsights}"</p>
                            </div>
                        </div>

                        {/* Individual Document Breakdown */}
                        {aiPackageResult.documentBreakdown && aiPackageResult.documentBreakdown.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-gray-900 border-b pb-2 pt-4">Individual Document Breakdown</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {aiPackageResult.documentBreakdown.map((doc, idx) => (
                                        <div key={idx} className={`p-5 rounded-lg border ${doc.status === 'Valid' ? 'bg-emerald-50/50 border-emerald-200' : doc.status === 'Error' ? 'bg-red-50/50 border-red-200' : 'bg-amber-50/50 border-amber-200'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                {doc.status === 'Valid' ? (
                                                    <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                                                ) : doc.status === 'Error' ? (
                                                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                                                ) : (
                                                    <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                                                )}
                                                <div>
                                                    <h5 className="font-bold text-gray-900">{doc.originalFileName || `Document ${idx + 1}`}</h5>
                                                    <p className="text-xs font-semibold text-gray-500 uppercase">AI Detected: {doc.inferredDocumentType}</p>
                                                </div>
                                            </div>

                                            {doc.issues && doc.issues.length > 0 && (
                                                <div className="mt-3 pl-8">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Discrepancies / Warnings</p>
                                                    <ul className={`text-sm list-disc pl-5 space-y-1 ${doc.status === 'Error' ? 'text-red-800' : 'text-amber-800'}`}>
                                                        {doc.issues.map((issue, i) => (
                                                            <li key={i}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button
                        type="button"
                        onClick={handleVerifyWithAI}
                        className="btn-secondary flex-1 sm:flex-none sm:w-64 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        disabled={isVerifying || selectedFiles.length === 0}
                    >
                        {isVerifying ? 'Analyzing...' : 'Analyze with Gemini AI'}
                    </button>
                    <button
                        type="button"
                        onClick={handleContinueToReview}
                        className="btn-primary flex-1 shadow-md shadow-indigo-200"
                        disabled={isVerifying}
                    >
                        Continue to Review
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

