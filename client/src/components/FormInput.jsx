export default function FormInput({ label, name, type = 'text', value, onChange, required, error, placeholder }) {
    return (
        <div className="form-group">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                className={`input-field ${error ? 'input-error' : ''}`}
                required={required}
            />
            {error && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <span>•</span>
                    {error}
                </p>
            )}
        </div>
    );
}
