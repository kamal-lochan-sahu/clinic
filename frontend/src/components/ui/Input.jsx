import { forwardRef } from "react";
import { clsx } from "clsx";

const Input = forwardRef(({ label, error, className, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input ref={ref} className={clsx("w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all", error ? "border-red-300 bg-red-50" : "border-gray-200", className)} {...props} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Input.displayName = "Input";
export default Input;
