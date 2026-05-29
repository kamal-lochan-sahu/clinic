import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, IndianRupee } from "lucide-react";
import { paymentService } from "../../services/payment.service";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Billing() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["payments", status], queryFn: () => paymentService.getAll({ status, limit: 50 }).then(r => r.data.data) });
  const { data: summary } = useQuery({ queryKey: ["day-summary"], queryFn: () => paymentService.getDaySummary().then(r => r.data.data) });

  const totalToday = summary?.reduce((s, g) => s + g.paid, 0) || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Billing & Payments</h2>
          <p className="text-sm text-gray-500">Today: {formatCurrency(totalToday)}</p>
        </div>
        <Button onClick={() => navigate("/billing/new")}><Plus size={16} />Create Bill</Button>
      </div>

      <div className="flex gap-2">
        {["","paid","partial","pending"].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (status === s ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <Loader text="Loading payments..." /> : data?.payments?.length === 0 ? (
        <EmptyState icon={IndianRupee} title="No payments found" action={<Button onClick={() => navigate("/billing/new")}><Plus size={16} />Create Bill</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Receipt","Patient","Date","Total","Paid","Due","Mode","Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.payments?.map((pay) => (
                <tr key={pay._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate("/billing/" + pay._id)}>
                  <td className="px-4 py-3 text-sm font-medium text-primary-600">{pay.receiptNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{pay.patientId?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(pay.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(pay.totalAmount)}</td>
                  <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(pay.paidAmount)}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{pay.dueAmount > 0 ? formatCurrency(pay.dueAmount) : "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{pay.paymentMode}</td>
                  <td className="px-4 py-3"><Badge variant={pay.status === "paid" ? "success" : pay.status === "partial" ? "warning" : "danger"}>{pay.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
