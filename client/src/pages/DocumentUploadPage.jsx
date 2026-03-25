import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, UploadCloud, AlertCircle, CheckCircle, FileText, Wand2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { removeBackground } from '@imgly/background-removal';
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
    const [isFixingBg, setIsFixingBg] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [loadingStepIdx, setLoadingStepIdx] = useState(0);
    const fileInputRef = useRef(null);

    const loadingMessages = [
        "Uploading encrypted payload...",
        "Initializing Gemini 1.5 Pro Vision AI...",
        "Scanning high-density document markers...",
        "Extracting explicit OCR entities...",
        "Finalizing form schema validation mapping..."
    ];

    useEffect(() => {
        let interval;
        if (isVerifying) {
            setLoadingStepIdx(0);
            interval = setInterval(() => {
                setLoadingStepIdx(prev => Math.min(prev + 1, loadingMessages.length - 1));
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isVerifying]);

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_FORM_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(parsed);
            } catch {
                // ignore
            }
        }
    }, []);

    const handleBackToForm = () => {
        navigate(`/apply/${serviceId}/state`);
    };

    const processFiles = async (newFiles) => {
        const processedFiles = [];
        for (const file of newFiles) {
            if (file.type.startsWith('image/')) {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: 'image/jpeg'
                };
                try {
                    const compressedFile = await imageCompression(file, options);
                    const finalFile = new File([compressedFile], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    processedFiles.push(finalFile);
                } catch (error) {
                    console.error('Error compressing image:', error);
                    processedFiles.push(file);
                }
            } else {
                processedFiles.push(file);
            }
        }
        setSelectedFiles(prev => [...prev, ...processedFiles]);
    };

    const handleFileSelect = async (e) => {
        if (e.target.files) {
            await processFiles(Array.from(e.target.files));
        }
    };

    const handleDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setAiPackageResult(null);
    };

    const fixPhotoBackground = async (fileToFix, index) => {
        if (!fileToFix.type.startsWith('image/')) return;
        setIsFixingBg(true);
        try {
            // 1. Remove background using local WASM AI
            const transparentBlob = await removeBackground(fileToFix, {
                output: { format: 'image/png' }
            });

            // 2. Draw transparent PNG onto a solid white canvas to make a passport photo
            const img = new Image();
            img.src = URL.createObjectURL(transparentBlob);
            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // Fill white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw person on top
            ctx.drawImage(img, 0, 0);

            // 3. Export as JPEG
            const whiteBgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            const finalFile = new File([whiteBgBlob], fileToFix.name.replace(/\.[^/.]+$/, "") + "-passport-fixed.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            setSelectedFiles(prev => {
                const newArr = [...prev];
                newArr[index] = finalFile;
                return newArr;
            });

        } catch (err) {
            console.error('Error removing background:', err);
            alert('Failed to process photo background.');
        } finally {
            setIsFixingBg(false);
        }
    };

    const handleExtractWithAI = async () => {
        if (selectedFiles.length === 0) return;
        setIsVerifying(true);
        setAiPackageResult(null);

        try {
            const formParams = new FormData();
            
            // Append all files to the 'documents' array expected by multer
            selectedFiles.forEach(file => {
                formParams.append('documents', file);
            });

            const response = await fetch(`${AI_API_BASE_URL}/api/extract`, {
                method: 'POST',
                body: formParams,
            });

            if (!response.ok) {
                const errorJson = await response.json();
                throw new Error(errorJson.error || `API returned ${response.status}`);
            }

            const json = await response.json();
            
            if (json.success && json.data) {
                // Merge extracted data into current form state
                const mergedData = { ...formData, ...json.data };
                setFormData(mergedData);
                localStorage.setItem(LOCAL_STORAGE_FORM_KEY, JSON.stringify(mergedData));
                
                setAiPackageResult({
                    status: 'success',
                    message: 'Data successfully extracted and pre-filled. You can proceed to the form to review it.',
                    data: json.data
                });
            } else {
                throw new Error("Could not find relevant applicant data in the documents.");
            }

        } catch (err) {
            console.error("AI Extraction Error:", err);
            setAiPackageResult({
                status: 'error',
                message: err.message || 'Failed to communicate with AI Backend.',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleContinueToReview = async () => {
        if (aiPackageResult) {
            localStorage.setItem('formitra_document_validation', JSON.stringify(aiPackageResult));
        } else {
            localStorage.removeItem('formitra_document_validation');
        }

        if (selectedFiles.length > 0) {
            try {
                const filePromises = selectedFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({
                            name: file.name,
                            type: file.type,
                            base64: reader.result
                        });
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    });
                });
                const base64Files = await Promise.all(filePromises);
                localStorage.setItem('formitra_files', JSON.stringify(base64Files));
            } catch (error) {
                console.error('Formitra AI: Error saving files to localStorage', error);
            }
        } else {
            localStorage.removeItem('formitra_files');
        }

        // We transition to the Form Page so user can review the Auto-Filled data
        navigate(`/apply/${serviceId}/${encodeURIComponent(decodedState)}/form`);
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
                        Back to State Selection
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-3">
                        Document Upload Portal
                        <span className="px-2 py-0.5 bg-black text-white rounded border border-zinc-800 text-[10px] font-bold tracking-widest uppercase shadow-sm whitespace-nowrap">
                            AI Intake Enabled
                        </span>
                    </h1>
                    <p className="text-gray-600 max-w-2xl text-sm md:text-base">
                        Upload your supporting documents here. Our Enterprise AI engine will automatically parse them, securely extract the data, and auto-fill your entire application instantly.
                    </p>
                </div>

                {/* Document Guidelines Section */}
                <div className="bg-slate-50 p-6 rounded-md border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-slate-700" />
                        Required Documents for Application
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-xs">1</span>
                            <div>
                                <p className="font-semibold text-gray-900">Recent Passport-Sized Photograph <span className="text-red-500">*</span></p>
                                <p className="text-gray-500">Color photo with a plain white or light background.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-xs">2</span>
                            <div>
                                <p className="font-semibold text-gray-900">Proof of Address <span className="text-red-500">*</span></p>
                                <p className="text-gray-500">E.g., Aadhaar Card, Voter ID, Electricity Bill, or Bank Passbook.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-zinc-50 border border-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-xs">3</span>
                            <div>
                                <p className="font-semibold text-gray-900">Proof of Date of Birth <span className="text-gray-400 font-normal">(Optional)</span></p>
                                <p className="text-gray-500">E.g., Birth Certificate, PAN Card, or School Leaving Certificate.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded bg-zinc-50 border border-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-xs">4</span>
                            <div>
                                <p className="font-semibold text-gray-900">Non-ECR Proof <span className="text-gray-400 font-normal">(Optional)</span></p>
                                <p className="text-gray-500">10th Standard Marksheet or higher educational degree.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div 
                    className={`card p-8 md:p-12 space-y-8 border-2 border-dashed transition-colors shadow-none text-center rounded-md cursor-pointer ${dragActive ? 'border-amber-500 bg-amber-50/30' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="mx-auto w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm pointer-events-none">
                        <UploadCloud size={32} className={`transition-colors ${dragActive ? 'text-amber-500' : 'text-slate-700'}`} />
                    </div>
                    <div className="pointer-events-none">
                        <p className={`text-lg font-medium ${dragActive ? 'text-amber-700' : 'text-gray-900'}`}>Drop your files here or click anywhere to browse</p>
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
                        className="btn-secondary pointer-events-none"
                    >
                        Browse Files
                    </button>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={20} className="text-amber-500" />
                            Documents ready for intelligence pipeline
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 font-bold text-xs uppercase">
                                            {file.name.split('.').pop()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-800 truncate font-medium">{file.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {file.type.startsWith('image/') && (
                                            <button
                                                onClick={() => fixPhotoBackground(file, idx)}
                                                disabled={isFixingBg}
                                                className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 flex items-center gap-1 border border-transparent hover:border-amber-200 rounded transition-colors disabled:opacity-50"
                                                title="Make this a passport photo with a white background"
                                            >
                                                <Wand2 size={12} />
                                                Fix BG
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeFile(idx)}
                                            disabled={isFixingBg}
                                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium px-2 disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isVerifying && (
                    <div className="p-10 text-center space-y-6 bg-white rounded-md shadow-sm border border-slate-200">
                        <div className="relative w-16 h-16 mx-auto">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-slate-800">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg text-slate-900 font-bold mb-2">Secure AI Extraction in Progress...</p>
                            <div className="h-6 overflow-hidden">
                                <motion.p 
                                    key={loadingStepIdx}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-sm font-medium text-amber-600 truncate"
                                >
                                    {loadingMessages[loadingStepIdx]}
                                </motion.p>
                            </div>
                        </div>
                    </div>
                )}

                {/* High-level error banner for backend / network failures */}
                {!isVerifying && aiPackageResult?.status === 'error' && (
                    <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-3 font-semibold">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                        <div>{aiPackageResult.message}</div>
                    </div>
                )}

                {aiPackageResult?.status === 'success' && !isVerifying && (
                    <div className="space-y-6 pt-4">
                        <div className="p-6 rounded-md border border-zinc-200 shadow-sm bg-white">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="text-black mt-1 flex-shrink-0" size={32} />
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-2 tracking-tight">Data Extracted Successfully</h3>
                                    <p className="text-sm font-semibold text-zinc-600">
                                        {aiPackageResult.message}
                                    </p>
                                    
                                    {/* Preview grid */}
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(aiPackageResult.data).map(([key, val]) => {
                                            if (!val) return null;
                                            return (
                                                <div key={key} className="bg-zinc-50 p-2 rounded border border-zinc-200 shadow-sm text-sm">
                                                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">{key}</div>
                                                    <div className="font-semibold text-slate-800 mt-0.5 truncate">{val}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post-Extraction Image Enhancements */}
                        {selectedFiles.some(f => f.type.startsWith('image/')) && (
                            <div className="p-6 rounded-md border border-zinc-200 shadow-sm bg-zinc-50">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1 w-10 h-10 bg-black rounded flex items-center justify-center">
                                        <Wand2 className="text-white" size={20} />
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">AI Photo Enhancements Available</h3>
                                        <p className="text-sm font-medium text-slate-600 mb-4">
                                            We noticed you uploaded photos. If they contain casual backgrounds, you can use our local WebAssembly engine to instantly strip the background and convert them into pure white, passport-ready headshots. 
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedFiles.map((file, idx) => {
                                                if (!file.type.startsWith('image/')) return null;
                                                return (
                                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-zinc-200 rounded-md">
                                                        <span className="text-xs font-semibold text-slate-700 truncate">{file.name}</span>
                                                        <button
                                                            onClick={() => fixPhotoBackground(file, idx)}
                                                            disabled={isFixingBg}
                                                            className="text-xs bg-black hover:bg-zinc-800 text-white font-bold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                                        >
                                                            <Wand2 size={14} />
                                                            {isFixingBg ? 'Processing...' : 'Auto-Fix Background'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <div className="flex flex-col flex-1 sm:flex-none sm:w-64 gap-1">
                        <button
                            type="button"
                            onClick={handleExtractWithAI}
                            className="btn-secondary w-full border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm"
                            disabled={isVerifying || selectedFiles.length === 0}
                        >
                            <span className="font-bold flex items-center justify-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                {isVerifying ? 'Extracting...' : 'Extract Applicant Data'}
                            </span>
                        </button>
                        <p className="text-[11px] text-gray-500 text-left font-medium">
                            Automatically parses details from Aadhaar/PAN
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleContinueToReview}
                        className="btn-primary flex-1 shadow-md"
                        disabled={isVerifying}
                    >
                        Continue to Application Form
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

