import { useState } from "react";
import { Search, X } from "lucide-react";
import { patientService } from "../../services/patient.service";
import { formatDate } from "../../utils/formatDate";

export default function PatientSearch({ onSelect, placeholder = "Search by name, phone or patient ID..." }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);
    if (value.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await patientService.search(value);
      setResults(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleSelect = (patient) => {
    onSelect(patient);
    setQuery(patient.name);
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        {query && <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((patient) => (
            <button key={patient._id} onClick={() => handleSelect(patient)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-sm font-semibold">{patient.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                <p className="text-xs text-gray-400">{patient.patientId} · {patient.phone}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
