import { BadgeCheck, AlertTriangle } from 'lucide-react';
import FileDropzone from './FileDropzone';

/**
 * High-level document upload card that combines:
 * - descriptive text about what the document is for
 * - FileDropzone for selection
 * - status chip and validation messages
 *
 * This keeps the upload UI modular and makes it easy to add
 * more documents later without duplicating layout logic.
 */
export default function DocumentCard({
    title,
    subtitle,
    description,
    accept,
    required = false,
    file,
    onFileChange,
    status, // 'missing' | 'valid' | 'invalid'
    issues = [],
}) {
    const isMissing = status === 'missing';
    const isValid = status === 'valid';
    const isInvalid = status === 'invalid';

    const statusLabel = isValid
        ? 'Looks good'
        : isInvalid
            ? 'Needs attention'
            : required
                ? 'Required'
                : 'Optional';

    const statusColorClass = isValid
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : isInvalid
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-gray-50 text-gray-700 border-gray-200';

    return (
        <div className="card p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        {required && (
                            <span className="px-2 py-0.5 text-[11px] rounded-full bg-red-50 text-red-700 border border-red-100">
                                Required
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColorClass}`}
                >
                    {isValid ? (
                        <BadgeCheck size={14} />
                    ) : (
                        <AlertTriangle size={14} />
                    )}
                    <span>{statusLabel}</span>
                </div>
            </div>

            {description && (
                <p className="text-xs md:text-sm text-gray-500">
                    {description}
                </p>
            )}

            <FileDropzone
                label="Upload file"
                description="Supported formats and size limits are applied during validation – you can still proceed with warnings."
                accept={accept}
                file={file}
                onFileChange={onFileChange}
            />

            {issues.length > 0 && (
                <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-semibold text-amber-900 mb-1.5">
                        Validation notes
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                        {issues.map((issue, index) => (
                            <li key={index} className="text-xs text-amber-800">
                                {issue}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {isValid && issues.length === 0 && file && (
                <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1">
                    <BadgeCheck size={12} />
                    Basic checks passed. Final decision always rests with the official portal.
                </p>
            )}
        </div>
    );
}

