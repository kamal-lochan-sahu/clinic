import { TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "blue", trend }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={"w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 " + colors[color]}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {trend !== undefined && (
        <div className={clsx("flex items-center gap-1 text-xs font-medium", trend >= 0 ? "text-green-600" : "text-red-600")}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
