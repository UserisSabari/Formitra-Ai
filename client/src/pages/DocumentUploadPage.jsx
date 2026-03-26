import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShieldCheck, UploadCloud, AlertCircle, CheckCircle, FileText, Wand2, Sparkles, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen bg-[#fafbfc] pb-24">
            {/* Minimalist Top Banner */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="container py-4 flex items-center justify-between">
                    <button
                        onClick={handleBackToForm}
                        className="flex items-center gap-2 text-slate-500 hover:text-[#1978E5] transition-colors text-sm font-semibold"
                    >
                        <ArrowLeft size={16} />
                        Back to Requirements
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
                        <span>{decodedState}</span>
                        <ChevronRight size={12} />
                        <span className="text-[#1978E5]">Upload</span>
                    </div>
                </div>
            </div>

            <div className="container py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-10"
                >
                    <div className="text-center space-y-4 mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase mb-2">
                            <Sparkles size={14} /> AI Intake Enabled
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            Secure Document Upload
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                            Upload your supporting documents here. Our Enterprise AI engine will automatically parse them, securely extract the data, and auto-fill your entire application instantly.
                        </p>
                    </div>

                    {/* Document Guidelines Section */}
                    <div className="card overflow-hidden border-0 shadow-soft">
                        <div className="h-1 w-full bg-linear-to-r from-[#1978E5] to-purple-500"></div>
                        <div className="p-6 md:p-8 bg-white">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText size={22} className="text-[#1978E5]" />
                                Required Documents Checklist
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                    <span className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm">1</span>
                                    <div>
                                        <p className="font-bold text-slate-900 mb-1">Recent Photograph <span className="text-red-500">*</span></p>
                                        <p className="text-slate-500 text-sm leading-relaxed">Color photo with a plain white or light background.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                    <span className="shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shadow-sm">2</span>
                                    <div>
                                        <p className="font-bold text-slate-900 mb-1">Proof of Address <span className="text-red-500">*</span></p>
                                        <p className="text-slate-500 text-sm leading-relaxed">Aadhaar Card, Voter ID, or Utility Bill.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                    <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100/50 border border-slate-200/50 text-slate-400 flex items-center justify-center font-bold text-sm">3</span>
                                    <div>
                                        <p className="font-bold text-slate-900 mb-1">Proof of Date of Birth <span className="text-slate-400 font-medium text-xs uppercase ml-1">(Optional)</span></p>
                                        <p className="text-slate-500 text-sm leading-relaxed">Birth Certificate or PAN Card.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                    <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100/50 border border-slate-200/50 text-slate-400 flex items-center justify-center font-bold text-sm">4</span>
                                    <div>
                                        <p className="font-bold text-slate-900 mb-1">Non-ECR Proof <span className="text-slate-400 font-medium text-xs uppercase ml-1">(Optional)</span></p>
                                        <p className="text-slate-500 text-sm leading-relaxed">10th Standard Marksheet or higher degree.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div 
                        className={`group relative p-10 md:p-16 flex flex-col items-center justify-center text-center transition-all duration-300 rounded-2xl cursor-pointer overflow-hidden ${
                            dragActive 
                                ? 'bg-[#1978E5]/10 border-2 border-dashed border-[#1978E5] scale-[1.02]' 
                                : 'bg-white border-2 border-dashed border-slate-300 hover:border-[#1978E5]/50 hover:bg-[#fafbfc] hover:shadow-lg'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                            dragActive ? 'bg-[#1978E5] text-white scale-110 shadow-blue-500/20' : 'bg-blue-50 text-[#1978E5] group-hover:scale-110 group-hover:bg-[#1978E5] group-hover:text-white'
                        }`}>
                            <UploadCloud size={40} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2 pointer-events-none">
                            <h3 className={`text-2xl font-bold tracking-tight ${dragActive ? 'text-[#1978E5]' : 'text-slate-900'}`}>
                                Drop your files here
                            </h3>
                            <p className="text-slate-500 text-base font-medium">
                                or <span className="text-[#1978E5] group-hover:underline">click to browse</span> from your device
                            </p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-6 uppercase tracking-widest pointer-events-none">
                            Accepts JPG, PNG, and PDF (Max 5MB)
                        </p>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,application/pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                    </div>

                {selectedFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
                            <CheckCircle size={20} className="text-[#1978E5]" />
                            Documents Ready for Intelligence Pipeline
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#1978E5]/30 hover:shadow-md transition-all group relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#1978E5]/10 flex items-center justify-center text-[#1978E5] shrink-0 font-bold text-xs uppercase">
                                            {file.name.split('.').pop()}
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            disabled={isFixingBg}
                                            className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                                            title="Remove File"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                        </button>
                                    </div>
                                    <div className="flex flex-col grow justify-end">
                                        <span className="text-sm text-slate-800 truncate font-semibold w-[90%]" title={file.name}>{file.name}</span>
                                        <span className="text-xs text-slate-400 font-medium mt-1">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>

                                    {/* Action row at bottom of card if applicable */}
                                    {file.type.startsWith('image/') && (
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => fixPhotoBackground(file, idx)}
                                                disabled={isFixingBg}
                                                className="w-full text-xs text-[#1978E5] bg-[#1978E5]/5 hover:bg-[#1978E5]/10 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                            >
                                                <Wand2 size={14} />
                                                Fix Background
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {isVerifying && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 text-center space-y-6 bg-white rounded-2xl shadow-soft border border-[#1978E5]/20 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1978E5] to-purple-500 animate-pulse"></div>
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-[#1978E5]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#1978E5] rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-[#1978E5]">
                                <ShieldCheck size={28} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xl text-slate-900 font-extrabold mb-3 tracking-tight">Enterprise AI Extraction Active</p>
                            <div className="h-6 overflow-hidden max-w-sm mx-auto bg-slate-50 rounded-full px-4 py-1">
                                <motion.p 
                                    key={loadingStepIdx}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-xs font-bold text-[#1978E5] uppercase tracking-wider truncate"
                                >
                                    {loadingMessages[loadingStepIdx]}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!isVerifying && aiPackageResult?.status === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-4 font-semibold shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <div className="leading-relaxed">{aiPackageResult.message}</div>
                    </motion.div>
                )}

                {aiPackageResult?.status === 'success' && !isVerifying && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4">
                        <div className="p-8 rounded-2xl border border-emerald-200 shadow-soft bg-emerald-50/30">
                            <div className="flex flex-col md:flex-row md:items-start gap-6">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                                    <CheckCircle size={28} strokeWidth={2.5} />
                                </div>
                                <div className="grow">
                                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Intelligence Payload Extracted</h3>
                                    <p className="text-sm font-medium text-slate-600 mb-6">
                                        Data successfully pulled from verified documents. Fields have been securely injected into your application memory.
                                    </p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(aiPackageResult.data).map(([key, val]) => {
                                            if (!val) return null;
                                            return (
                                                <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">{key}</div>
                                                    <div className="font-bold text-slate-800 text-sm truncate">{val}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedFiles.some(f => f.type.startsWith('image/')) && (
                            <div className="p-8 rounded-2xl border border-purple-200 shadow-soft bg-purple-50/30">
                                <div className="flex flex-col md:flex-row md:items-start gap-6">
                                    <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-purple-200">
                                        <Wand2 size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="grow">
                                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Image Enhancement Available</h3>
                                        <p className="text-sm font-medium text-slate-600 mb-6">
                                            We noticed passport-style photos. Instantly strip casual backgrounds entirely in-browser using our local AI WASM engine for perfect ID compliance.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedFiles.map((file, idx) => {
                                                if (!file.type.startsWith('image/')) return null;
                                                return (
                                                    <div key={idx} className="flex flex-col gap-3 p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                                                        <span className="text-sm font-bold text-slate-800 truncate">{file.name}</span>
                                                        <button
                                                            onClick={() => fixPhotoBackground(file, idx)}
                                                            disabled={isFixingBg}
                                                            className="text-xs bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                                                        >
                                                            <Wand2 size={14} />
                                                            {isFixingBg ? 'Processing WASM...' : 'Auto-Fix Background'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-10 mt-6 border-t border-slate-200">
                    <div className="w-full sm:w-auto grow max-w-sm flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleExtractWithAI}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            disabled={isVerifying || selectedFiles.length === 0}
                        >
                            <ShieldCheck size={18} className="text-[#1978E5]" />
                            {isVerifying ? 'Extracting Core Data...' : 'Run Smart Extraction'}
                        </button>
                        <p className="text-xs text-slate-500 font-medium text-center">
                            Auto-fills form instantly from documents
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleContinueToReview}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1978E5] hover:bg-[#1461bd] text-white font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20 disabled:opacity-50 grow"
                        disabled={isVerifying}
                    >
                        Proceed to Main Application
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
        </div>
    );
}

