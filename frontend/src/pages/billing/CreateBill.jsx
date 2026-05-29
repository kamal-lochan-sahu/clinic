import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { paymentService } from "../../services/payment.service";
import PatientSearch from "../../components/patient/PatientSearch";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { PAYMENT_MODES } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

export default function CreateBill() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { register, handleSubmit, watch, control } = useForm({ defaultValues: { items: [{ type: "consultation", description: "Consultation Fee", amount: 500 }], paymentMode: "cash", paidAmount: 0, discount: 0 } });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = watch("discount") || 0;
  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const total = subtotal - Number(discount);

  const createPayment = useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payments"] }); toast.success("Bill created!"); navigate("/billing"); },
  });

  const onSubmit = async (data) => {
    if (!selectedPatient) { toast.error("Please select a patient"); return; }
    await createPayment.mutateAsync({ ...data, patientId: selectedPatient._id, subtotal, totalAmount: total, items: data.items.map(i => ({ ...i, amount: Number(i.amount) })), paidAmount: Number(data.paidAmount), discount: Number(data.discount) || 0 });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold text-gray-900">Create Bill</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Patient</h3>
          <PatientSearch onSelect={setSelectedPatient} />
          {selectedPatient && <div className="bg-primary-50 rounded-lg p-3 text-sm"><strong>{selectedPatient.name}</strong> · {selectedPatient.patientId}</div>}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Bill Items</h3>
            <Button type="button" size="sm" variant="secondary" onClick={() => append({ type: "consultation", description: "", amount: 0 })}><Plus size={14} />Add Item</Button>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5"><Input label={i === 0 ? "Description" : ""} placeholder="Description" {...register("items." + i + ".description")} /></div>
              <div className="col-span-3"><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white" {...register("items." + i + ".type")}><option value="consultation">Consultation</option><option value="medicine">Medicine</option><option value="lab">Lab</option><option value="other">Other</option></select></div>
              <div className="col-span-3"><Input type="number" label={i === 0 ? "Amount" : ""} placeholder="0" {...register("items." + i + ".amount")} /></div>
              <div className="col-span-1">{fields.length > 1 && <button type="button" onClick={() => remove(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}</div>
            </div>
          ))}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount (Rs.)" type="number" placeholder="0" {...register("discount")} />
            <Select label="Payment Mode" options={PAYMENT_MODES.map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))} {...register("paymentMode")} />
            <Input label="Amount Paid (Rs.)" type="number" placeholder="0" {...register("paidAmount")} />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-500">- {formatCurrency(Number(discount))}</span></div>
            <div className="flex justify-between font-bold border-t border-gray-200 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={createPayment.isPending}>Create Bill</Button>
        </div>
      </form>
    </div>
  );
}
