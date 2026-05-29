import { clsx } from "clsx";

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx("bg-white rounded-xl border border-gray-100 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx("px-6 py-4 border-b border-gray-100", className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={clsx("px-6 py-4", className)}>{children}</div>;
}
