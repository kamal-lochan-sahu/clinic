import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

export default function Staff() {
  const { data, isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => api.get("/staff").then(r => r.data.data) });
  if (isLoading) return <Loader text="Loading staff..." />;
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
      {!data?.length ? <EmptyState icon={UserCog} title="No staff added" description="Add staff members to manage roles" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(member => (
            <div key={member._id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-primary-600 font-bold text-lg">{member.userId?.name?.[0]}</span></div>
                <div><p className="font-semibold text-gray-900">{member.userId?.name}</p><p className="text-xs text-gray-400">{member.designation}</p></div>
              </div>
              <Badge variant="info" className="capitalize">{member.userId?.role}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
