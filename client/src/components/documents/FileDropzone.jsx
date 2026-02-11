import { useCallback, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

/**
 * Generic drag-and-drop file input with a visual dropzone.
 *
 * This component does not perform any validation by itself – it simply
 * exposes the selected File object via the onFileChange callback.
 * Validation is handled by higher-level logic so that rules stay
 * centralised and testable.
 */
export default function FileDropzone({
    label,
    description,
    accept,
    onFileChange,
    file,
    disabled = false,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files?.[0] || null;
        onFileChange?.(selectedFile);
    };

    const handleDrop = useCallback(
        (event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
            if (disabled) return;

            const droppedFile = event.dataTransfer.files?.[0] || null;
            if (droppedFile) {
                onFileChange?.(droppedFile);
            }
        },
        [disabled, onFileChange]
    );

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleClear = (event) => {
        event.stopPropagation();
        if (disabled) return;
        onFileChange?.(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const formatSize = (sizeInBytes) => {
        if (!sizeInBytes && sizeInBytes !== 0) return '';
        const mb = sizeInBytes / (1024 * 1024);
        if (mb < 1) {
            const kb = sizeInBytes / 1024;
            return `${kb.toFixed(1)} KB`;
        }
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="space-y-2">
            {label && (
                <p className="text-sm font-medium text-gray-800">
                    {label}
                </p>
            )}
            {description && (
                <p className="text-xs text-gray-500">
                    {description}
                </p>
            )}

            <div
                className={`mt-2 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
                    disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : isDragging
                            ? 'border-indigo-500 bg-indigo-50/40'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                }`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={disabled}
                />

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <UploadCloud size={20} className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                            {file ? 'Replace file' : 'Drag and drop file here'}
                        </p>
                        <p className="text-xs text-gray-500">
                            or <span className="text-indigo-600 font-medium">click to browse</span>
                        </p>
                    </div>
                    {file && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            aria-label="Remove file"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {file && (
                    <div className="mt-4 flex items-center gap-3 rounded-lg bg-white/70 border border-gray-100 p-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FileIcon size={18} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">
                                {file.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                                {formatSize(file.size)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

