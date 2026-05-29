import { useState, useEffect } from "react";
import { Search, X, UserPlus } from "lucide-react";
import { patientService } from "../../services/patient.service";
import { useNavigate } from "react-router-dom";

export default function PatientSearch({ onSelect, placeholder = "Search by name, phone or patient ID...", showQuickAdd = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();

  // Debounce — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Search only when debounced value changes
  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); return; }
    setLoading(true);
    patientService.search(debouncedQuery)
      .then(({ data }) => setResults(data.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (patient) => {
    onSelect(patient);
    setQuery(patient.name);
    setResults([]);
  };

  const handleClear = () => { setQuery(""); setResults([]); onSelect(null); };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />}
        {query && !loading && <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
      </div>

      {(results.length > 0 || (debouncedQuery.length >= 2 && !loading && results.length === 0)) && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((patient) => (
            <button key={patient._id} onClick={() => handleSelect(patient)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-sm font-semibold">{patient.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                <p className="text-xs text-gray-400">{patient.patientId} · {patient.phone}</p>
              </div>
            </button>
          ))}
          {/* Quick Add Patient — if not found */}
          {results.length === 0 && debouncedQuery.length >= 2 && showQuickAdd && (
            <button onClick={() => navigate("/patients/new")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 text-left border-t border-gray-100">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600">Add New Patient</p>
                <p className="text-xs text-gray-400">No patient found — register new patient</p>
              </div>
            </button>
          )}
          {results.length === 0 && debouncedQuery.length >= 2 && !showQuickAdd && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No patients found</div>
          )}
        </div>
      )}
    </div>
  );
}
