import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services/analytics.service";
import { formatCurrency } from "../../utils/formatCurrency";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
    <div className="h-[200px] bg-gray-50 rounded-xl flex items-end gap-2 px-4 pb-4">
      {[40,70,55,80,65,90,75,60,85,70,95,80].map((h,i) => (
        <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: h + "%" }} />
      ))}
    </div>
  </div>
);

const COLORS = ["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

export default function Analytics() {
  const [period, setPeriod] = useState("month");

  const { data: revenue, isLoading: rLoading } = useQuery({
    queryKey: ["revenue", period],
    queryFn: () => analyticsService.getRevenue(period).then(r => r.data.data),
  });

  const { data: patients, isLoading: pLoading } = useQuery({
    queryKey: ["patient-analytics"],
    queryFn: () => analyticsService.getPatients().then(r => r.data.data),
  });

  const { data: diagnoses, isLoading: dLoading } = useQuery({
    queryKey: ["diagnoses"],
    queryFn: () => analyticsService.getDiagnoses().then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex gap-2">
          {["week","month","year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
                (period === p ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Revenue — {period.charAt(0).toUpperCase() + period.slice(1)}
        </h3>
        {rLoading ? <ChartSkeleton /> : !revenue?.length ? (
          <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
            No revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => "₹" + (v/1000).toFixed(0) + "k"} />
              <Tooltip formatter={v => [formatCurrency(v), "Revenue"]} />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* New Patients Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Patients (30 days)</h3>
          {pLoading ? <ChartSkeleton /> : !patients?.length ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              No patient data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={patients}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Diagnoses */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Diagnoses (30 days)</h3>
          {dLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-100" />
                  <div className="h-3 bg-gray-100 rounded flex-1" />
                  <div className="h-3 bg-gray-100 rounded w-8" />
                </div>
              ))}
            </div>
          ) : !diagnoses?.length ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              No diagnosis data yet
            </div>
          ) : (
            <div className="space-y-3">
              {diagnoses.slice(0, 8).map((d, i) => {
                const maxCount = diagnoses[0].count;
                return (
                  <div key={d._id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{d._id}</span>
                        <span className="text-sm font-semibold text-gray-900 ml-2">{d.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: (d.count / maxCount * 100) + "%", backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
