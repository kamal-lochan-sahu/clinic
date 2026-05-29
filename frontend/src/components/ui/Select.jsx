import { forwardRef } from "react";
import { clsx } from "clsx";

const Select = forwardRef(({ label, error, options = [], placeholder, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select ref={ref} className={clsx("w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white", error ? "border-red-300" : "border-gray-200", className)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Select.displayName = "Select";
export default Select;
