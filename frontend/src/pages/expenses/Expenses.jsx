import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Plus } from "lucide-react";
import api from "../../services/api";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const CATEGORIES = ["rent","salary","medicines","equipment","maintenance","other"];

export default function Expenses() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { category: "other", date: new Date().toISOString().split("T")[0] }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", month, year],
    queryFn: () => api.get("/expenses", { params: { month, year } }).then(r => r.data.data)
  });

  const createExpense = useMutation({
    mutationFn: (data) => api.post("/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense recorded!");
      setShowModal(false);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to record expense"),
  });

  const onSubmit = (data) => {
    if (data.amount <= 0) { toast.error("Amount must be greater than 0"); return; }
    createExpense.mutate({ ...data, amount: Number(data.amount) });
  };

  const categoryColors = {
    rent: "info", salary: "purple", medicines: "success",
    equipment: "warning", maintenance: "warning", other: "gray"
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
        <Button onClick={() => setShowModal(true)}><Plus size={16} />Add Expense</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
          <select value={month} onChange={e => setMonth(+e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
              <option key={m} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
          <input type="number" value={year} onChange={e => setYear(+e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      {data?.total !== undefined && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 col-span-2 md:col-span-1">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(data.total)}</p>
          </div>
          {CATEGORIES.filter(c => data?.expenses?.some(e => e.category === c)).map(cat => {
            const catTotal = data?.expenses?.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
            return (
              <div key={cat} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 capitalize">{cat}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(catTotal)}</p>
              </div>
            );
          })}
        </div>
      )}

      {isLoading ? <Loader text="Loading expenses..." /> : !data?.expenses?.length ? (
        <EmptyState icon={Receipt} title="No expenses recorded" description="Track clinic expenses here"
          action={<Button onClick={() => setShowModal(true)}><Plus size={16} />Add Expense</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Date","Category","Description","Amount"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3"><Badge variant={categoryColors[exp.category] || "gray"} className="capitalize">{exp.category}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{exp.description || "-"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add Expense">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" {...register("category", { required: true })}>
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <Input label="Amount (Rs.) *" type="number" min="1" step="0.01" placeholder="500"
            error={errors.amount?.message}
            {...register("amount", { required: "Amount required", min: { value: 1, message: "Amount must be positive" } })} />
          <Input label="Description" placeholder="Monthly rent payment..." {...register("description")} />
          <Input label="Date *" type="date" {...register("date", { required: "Date required" })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createExpense.isPending}>Record Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
