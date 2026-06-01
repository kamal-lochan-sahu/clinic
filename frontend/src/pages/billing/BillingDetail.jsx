import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, ExternalLink, IndianRupee } from "lucide-react";
import { paymentService } from "../../services/payment.service";
import Loader from "../../components/ui/Loader";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export default function BillingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", id],
    queryFn: () => paymentService.getById(id).then(r => r.data.data),
  });

  if (isLoading) return <Loader text="Loading bill..." />;
  if (!payment) return <div className="text-center py-12 text-gray-500">Bill not found</div>;

  const statusColors = { paid: "success", partial: "warning", pending: "danger" };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
        </div>
        {payment.receiptUrl && (
          <a href={payment.receiptUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />Download Receipt PDF
          </a>
        )}
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Receipt Number</p>
            <p className="text-xl font-bold text-gray-900">{payment.receiptNumber}</p>
          </div>
          <Badge variant={statusColors[payment.status] || "gray"} className="text-sm px-3 py-1">
            {payment.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Patient</p>
            <p className="font-semibold text-gray-900">{payment.patientId?.name}</p>
            <p className="text-xs text-gray-400">{payment.patientId?.patientId}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date & Time</p>
            <p className="font-semibold text-gray-900">{formatDateTime(payment.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Payment Mode</p>
            <p className="font-semibold text-gray-900 capitalize">{payment.paymentMode}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Bill Items</h3>
        <div className="space-y-2">
          {payment.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-400 capitalize">{item.type}</p>
              </div>
              <p className="text-sm font-semibold">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(payment.subtotal)}</span>
          </div>
          {payment.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-red-500">- {formatCurrency(payment.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(payment.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Paid</span>
            <span>{formatCurrency(payment.paidAmount)}</span>
          </div>
          {payment.dueAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600 font-medium">
              <span>Due</span>
              <span>{formatCurrency(payment.dueAmount)}</span>
            </div>
          )}
        </div>
      </Card>

      {payment.receiptUrl && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Receipt PDF Generated</p>
            <p className="text-xs text-green-600">Click to open or download</p>
          </div>
          <a href={payment.receiptUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium">
            <ExternalLink size={14} />Open PDF
          </a>
        </div>
      )}
    </div>
  );
}
