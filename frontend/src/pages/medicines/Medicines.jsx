import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle, Package, X, Edit, Trash2 } from "lucide-react";
import { medicineService } from "../../services/medicine.service";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editMedicine, setEditMedicine] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["medicines", search], queryFn: () => medicineService.getAll({ search }).then(r => r.data.data) });
  const { data: lowStock } = useQuery({ queryKey: ["low-stock"], queryFn: () => medicineService.getLowStock().then(r => r.data.data) });
  const { data: expiring } = useQuery({ queryKey: ["expiring"], queryFn: () => medicineService.getExpiring().then(r => r.data.data) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMedicine = useMutation({
    mutationFn: medicineService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock"] });
      toast.success("Medicine added successfully!");
      setShowModal(false);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to add medicine"),
  });

  const updateMedicine = useMutation({
    mutationFn: ({ id, data }) => medicineService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated!");
      setShowModal(false);
      setEditMedicine(null);
      reset();
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: medicineService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine removed");
    },
  });

  const onSubmit = (data) => {
    if (data.stock < 0) { toast.error("Stock cannot be negative"); return; }
    if (data.sellingPrice < 0) { toast.error("Price cannot be negative"); return; }
    if (editMedicine) {
      updateMedicine.mutate({ id: editMedicine._id, data });
    } else {
      createMedicine.mutate(data);
    }
  };

  const handleEdit = (med) => {
    setEditMedicine(med);
    reset({
      name: med.name, genericName: med.genericName,
      category: med.category, manufacturer: med.manufacturer,
      stock: med.stock, unit: med.unit, minStock: med.minStock,
      sellingPrice: med.sellingPrice, purchasePrice: med.purchasePrice,
      expiryDate: med.expiryDate ? med.expiryDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Remove this medicine from inventory?")) deleteMedicine.mutate(id);
  };

  const displayed = tab === "low" ? lowStock : tab === "expiring" ? expiring : data?.medicines;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Medicine Inventory</h2>
          <p className="text-sm text-gray-500">{data?.total || 0} medicines · {lowStock?.length || 0} low stock · {expiring?.length || 0} expiring</p>
        </div>
        <Button onClick={() => { setEditMedicine(null); reset({}); setShowModal(true); }}>
          <Plus size={16} />Add Medicine
        </Button>
      </div>

      {(lowStock?.length > 0 || expiring?.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            {lowStock?.length > 0 && <strong>{lowStock.length} medicines low on stock</strong>}
            {lowStock?.length > 0 && expiring?.length > 0 && " · "}
            {expiring?.length > 0 && <strong>{expiring.length} expiring within 30 days</strong>}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {["all","low","expiring"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors " + (tab === t ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {t === "all" ? "All Medicines" : t === "low" ? "Low Stock (" + (lowStock?.length || 0) + ")" : "Expiring (" + (expiring?.length || 0) + ")"}
          </button>
        ))}
      </div>

      {tab === "all" && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      )}

      {isLoading ? <Loader text="Loading medicines..." /> : !displayed?.length ? (
        <EmptyState icon={Package} title="No medicines found" description="Add medicines to track inventory"
          action={<Button onClick={() => setShowModal(true)}><Plus size={16} />Add Medicine</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Name","Category","Stock","Expiry","Price","Status","Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed?.map((med) => (
                <tr key={med._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{med.name}</p><p className="text-xs text-gray-400">{med.genericName}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{med.category || "-"}</td>
                  <td className="px-4 py-3"><span className={"text-sm font-semibold " + (med.stock <= med.minStock ? "text-red-600" : "text-gray-900")}>{med.stock} {med.unit}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(med.expiryDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(med.sellingPrice)}</td>
                  <td className="px-4 py-3">{med.stock <= med.minStock ? <Badge variant="danger">Low Stock</Badge> : <Badge variant="success">In Stock</Badge>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(med)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(med._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditMedicine(null); reset({}); }}
        title={editMedicine ? "Edit Medicine" : "Add Medicine"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Medicine Name *" placeholder="Paracetamol 500mg" error={errors.name?.message}
              {...register("name", { required: "Medicine name required" })} />
            <Input label="Generic Name" placeholder="Acetaminophen" {...register("genericName")} />
            <Input label="Category" placeholder="Analgesic, Antibiotic..." {...register("category")} />
            <Input label="Manufacturer" placeholder="Sun Pharma..." {...register("manufacturer")} />
            <Input label="Current Stock *" type="number" min="0" placeholder="100"
              error={errors.stock?.message}
              {...register("stock", { required: "Stock required", min: { value: 0, message: "Stock cannot be negative" } })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" {...register("unit")}>
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="ml">ml (Syrup)</option>
                <option value="mg">mg</option>
                <option value="strip">Strip</option>
                <option value="vial">Vial</option>
                <option value="tube">Tube</option>
              </select>
            </div>
            <Input label="Min Stock Alert" type="number" min="0" placeholder="10" {...register("minStock")} />
            <Input label="Expiry Date" type="date" {...register("expiryDate")} />
            <Input label="Purchase Price (Rs.)" type="number" min="0" step="0.01" placeholder="0" {...register("purchasePrice")} />
            <Input label="Selling Price (Rs.)" type="number" min="0" step="0.01" placeholder="0" {...register("sellingPrice")} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditMedicine(null); reset({}); }}>Cancel</Button>
            <Button type="submit" loading={createMedicine.isPending || updateMedicine.isPending}>
              {editMedicine ? "Update Medicine" : "Add Medicine"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
