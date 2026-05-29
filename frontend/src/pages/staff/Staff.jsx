import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCog, Plus, IndianRupee } from "lucide-react";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useForm } from "react-hook-form";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const ROLES = ["doctor", "receptionist", "nurse"];

export default function Staff() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const queryClient = useQueryClient();

  const { register: regStaff, handleSubmit: handleStaff, reset: resetStaff, formState: { errors: errStaff } } = useForm();
  const { register: regSalary, handleSubmit: handleSalary, reset: resetSalary } = useForm({
    defaultValues: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
  });

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get("/staff").then(r => r.data.data),
  });

  const addStaff = useMutation({
    mutationFn: (data) => api.post("/staff", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added!");
      setShowAddModal(false);
      resetStaff();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to add staff"),
  });

  const addSalary = useMutation({
    mutationFn: ({ staffId, data }) => api.post("/staff/" + staffId + "/salary", data),
    onSuccess: () => {
      toast.success("Salary recorded!");
      setShowSalaryModal(false);
      resetSalary();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to record salary"),
  });

  const roleColors = { owner: "purple", doctor: "info", receptionist: "success", nurse: "warning" };
  const staffList = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-sm text-gray-500">{staffList.length} staff members</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); resetStaff(); }}>
          <Plus size={16} />Add Staff
        </Button>
      </div>

      {isLoading ? <Loader text="Loading staff..." /> : staffList.length === 0 ? (
        <EmptyState icon={UserCog} title="No staff added"
          description="Add doctors, receptionists, and nurses"
          action={<Button onClick={() => setShowAddModal(true)}><Plus size={16} />Add Staff</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map(member => (
            <div key={member._id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-lg">{member.userId?.name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{member.userId?.name}</p>
                  <p className="text-xs text-gray-400">{member.designation || member.userId?.role}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={roleColors[member.userId?.role] || "gray"} className="capitalize">
                  {member.userId?.role}
                </Badge>
                <p className="text-sm text-gray-500">{member.userId?.phone}</p>
              </div>
              {member.salary?.amount > 0 && (
                <p className="text-sm text-gray-600">Salary: <strong>{formatCurrency(member.salary.amount)}/month</strong></p>
              )}
              <button onClick={() => { setSelectedStaff(member); setShowSalaryModal(true); }}
                className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors">
                <IndianRupee size={14} />Record Salary Payment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); resetStaff(); }} title="Add Staff Member" size="lg">
        <form onSubmit={handleStaff(data => addStaff.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *" placeholder="Dr. Priya Singh"
              error={errStaff.name?.message}
              {...regStaff("name", { required: "Name required" })} />
            <Input label="Email *" type="email" placeholder="staff@clinic.com"
              error={errStaff.email?.message}
              {...regStaff("email", { required: "Email required" })} />
            <Input label="Phone *" placeholder="9876543210"
              error={errStaff.phone?.message}
              {...regStaff("phone", { required: "Phone required" })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...regStaff("role", { required: true })}>
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <Input label="Designation" placeholder="Senior Receptionist" {...regStaff("designation")} />
            <Input label="Monthly Salary (Rs.)" type="number" min="0" placeholder="15000"
              {...regStaff("salary.amount")} />
            <Input label="Password *" type="password" placeholder="Create password"
              error={errStaff.password?.message}
              {...regStaff("password", { required: "Password required", minLength: { value: 6, message: "Min 6 chars" } })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={addStaff.isPending}>Add Staff Member</Button>
          </div>
        </form>
      </Modal>

      {/* Salary Modal */}
      <Modal open={showSalaryModal} onClose={() => { setShowSalaryModal(false); resetSalary(); }} title="Record Salary Payment">
        <form onSubmit={handleSalary(data => addSalary.mutate({ staffId: selectedStaff?._id, data }))} className="space-y-4">
          {selectedStaff && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{selectedStaff.userId?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{selectedStaff.userId?.role}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                {...regSalary("month")}>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i) => (
                  <option key={m} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <Input label="Year" type="number" {...regSalary("year")} />
            <Input label="Basic Salary (Rs.) *" type="number" min="0"
              defaultValue={selectedStaff?.salary?.amount || 0}
              {...regSalary("basicSalary", { required: true })} />
            <Input label="Net Salary (Rs.) *" type="number" min="0"
              defaultValue={selectedStaff?.salary?.amount || 0}
              {...regSalary("netSalary", { required: true })} />
            <Input label="Advance (Rs.)" type="number" min="0" defaultValue={0} {...regSalary("advance")} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                {...regSalary("paymentMode")}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>
          </div>
          <Input label="Note" placeholder="May 2026 salary payment" {...regSalary("note")} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowSalaryModal(false)}>Cancel</Button>
            <Button type="submit" loading={addSalary.isPending}>Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
