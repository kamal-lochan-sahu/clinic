import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { medicineService } from "../../services/medicine.service";

export default function MedicineAutoSuggest({ value, onChange, placeholder = "Medicine name..." }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await medicineService.getAll({ search: val, limit: 8 });
        setSuggestions(data.data?.medicines || []);
        setShowDropdown(true);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
  };

  const handleSelect = (medicine) => {
    setQuery(medicine.name);
    onChange(medicine.name);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((med) => (
            <button key={med._id} type="button" onClick={() => handleSelect(med)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary-50 text-left border-b border-gray-50 last:border-0 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                {med.genericName && <p className="text-xs text-gray-400">{med.genericName}</p>}
              </div>
              <div className="text-right">
                <p className={"text-xs font-medium " + (med.stock <= med.minStock ? "text-red-500" : "text-green-600")}>
                  Stock: {med.stock} {med.unit}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
