import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import { usePatients, useDebounce } from "../../hooks/usePatients";
import PatientCard from "../../components/patient/PatientCard";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 400);
  const { data, isLoading } = usePatients({ search: debouncedSearch, page, limit: 20 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Patients</h2>
          <p className="text-sm text-gray-500">{data?.total || 0} total patients</p>
        </div>
        <Button onClick={() => navigate("/patients/new")}><Plus size={16} />New Patient</Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, phone, or patient ID..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {isLoading ? <Loader text="Loading patients..." /> : data?.patients?.length === 0 ? (
        <EmptyState icon={Users} title="No patients found"
          description={search ? "Try different search terms" : "Register your first patient"}
          action={<Button onClick={() => navigate("/patients/new")}><Plus size={16} />Add Patient</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.patients?.map((patient) => <PatientCard key={patient._id} patient={patient} />)}
        </div>
      )}

      {data?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {data.totalPages}</span>
          <Button variant="secondary" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
