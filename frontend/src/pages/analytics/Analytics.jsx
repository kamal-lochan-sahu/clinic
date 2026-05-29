import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analytics.service";
import Loader from "../../components/ui/Loader";
import { formatCurrency } from "../../utils/formatCurrency";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";

const COLORS = ["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

export default function Analytics() {
  const [period, setPeriod] = useState("month");
  const { data: revenue, isLoading: rLoading } = useQuery({ queryKey: ["revenue", period], queryFn: () => analyticsService.getRevenue(period).then(r => r.data.data) });
  const { data: patients } = useQuery({ queryKey: ["patient-analytics"], queryFn: () => analyticsService.getPatients().then(r => r.data.data) });
  const { data: diagnoses } = useQuery({ queryKey: ["diagnoses"], queryFn: () => analyticsService.getDiagnoses().then(r => r.data.data) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex gap-2">
          {["week","month","year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (period === p ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600")}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {rLoading ? <Loader text="Loading analytics..." /> : (
        <>
          {revenue && revenue.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revenue — {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => "₹" + (v/1000).toFixed(0) + "k"} />
                  <Tooltip formatter={v => [formatCurrency(v), "Revenue"]} />
                  <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {patients && patients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">New Patients (30 days)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={patients}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {diagnoses && diagnoses.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Diagnoses (30 days)</h3>
                <div className="space-y-2">
                  {diagnoses.slice(0,8).map((d, i) => (
                    <div key={d._id} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-700 flex-1 truncate">{d._id}</span>
                      <span className="text-sm font-semibold text-gray-900">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
