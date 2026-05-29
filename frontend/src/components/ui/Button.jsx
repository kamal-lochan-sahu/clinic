import { clsx } from "clsx";

const variants = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  ghost: "hover:bg-gray-100 text-gray-700",
  success: "bg-green-500 hover:bg-green-600 text-white",
};
const sizes = { sm: "py-1.5 px-3 text-xs", md: "py-2 px-4 text-sm", lg: "py-2.5 px-6 text-base" };

export default function Button({ children, variant = "primary", size = "md", className, loading, disabled, ...props }) {
  return (
    <button disabled={disabled || loading} className={clsx("font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed", variants[variant], sizes[size], className)} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}
