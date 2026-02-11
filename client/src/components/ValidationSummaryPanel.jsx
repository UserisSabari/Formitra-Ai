import { FileText } from 'lucide-react';

/**
 * Reusable panel to display rejection risk score and key reasons.
 * Used on DocumentUploadPage, ReviewPage, and SuccessPage.
 */
export default function ValidationSummaryPanel({ overallRisk, compact = false }) {
    if (!overallRisk) {
        return (
            <div className="rounded-xl border p-4 md:p-5 bg-gray-50 border-gray-200">
                <div className="flex items-start gap-3">
                    <FileText size={18} className="mt-0.5 text-gray-500" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                            Rejection risk estimate
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                            No risk estimate yet. Run validation or continue to review to see results.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { score, level, reasons } = overallRisk;

    const riskLabel =
        level === 'high'
            ? 'High rejection risk (review strongly recommended)'
            : level === 'medium'
                ? 'Medium rejection risk (review suggested)'
                : level === 'low'
                    ? 'Low rejection risk (no guarantee of approval)'
                    : 'Unknown';

    const riskColorClass =
        level === 'high'
            ? 'bg-red-50 border-red-200 text-red-900'
            : level === 'medium'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : level === 'low'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-gray-50 border-gray-200 text-gray-800';

    return (
        <div className={`rounded-xl border p-4 md:p-5 ${riskColorClass}`}>
            <div className="flex items-start gap-3">
                <FileText size={18} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1">
                        Rejection risk estimate
                    </p>
                    <p className="text-xs md:text-sm mb-1">
                        {riskLabel}
                    </p>
                    <p className="text-[11px] opacity-80">
                        Score: {score} / 100. This is a heuristic based on file format,
                        image quality, and basic consistency checks – it is not an official decision.
                    </p>
                    {!compact && reasons?.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-xs space-y-0.5">
                            {reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
