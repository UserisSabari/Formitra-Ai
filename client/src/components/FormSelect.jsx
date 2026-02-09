import { ChevronDown } from 'lucide-react';

export default function FormSelect({ label, name, value, onChange, options, required, error, placeholder }) {
    return (
        <div className="form-group">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`input-field appearance-none cursor-pointer pr-10 ${error ? 'input-error' : ''} ${!value ? 'text-gray-400' : 'text-gray-900'}`}
                    required={required}
                >
                    <option value="">{placeholder || `Select ${label}`}</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt} className="text-gray-900">
                            {opt}
                        </option>
                    ))}
                </select>
                <ChevronDown 
                    size={18} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
            </div>
            {error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {error}
                </p>
            )}
        </div>
    );
}
