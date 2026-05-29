import { useQuery } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/formatDate";

export default function LabTests() {
  const { data, isLoading } = useQuery({ queryKey: ["labtests"], queryFn: () => api.get("/labtests").then(r => r.data.data) });
  if (isLoading) return <Loader text="Loading lab tests..." />;
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Lab Tests</h2>
      {!data?.length ? <EmptyState icon={FlaskConical} title="No lab tests" description="Lab test orders will appear here" /> : (
        <div className="space-y-3">
          {data.map(test => (
            <div key={test._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{test.patientId?.name}</p>
                  <p className="text-xs text-gray-400">{test.tests?.map(t => t.name).join(", ")}</p>
                  <p className="text-xs text-gray-400">{formatDate(test.createdAt)}</p>
                </div>
                <Badge variant={test.status === "completed" ? "success" : test.status === "ordered" ? "info" : "warning"}>{test.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
