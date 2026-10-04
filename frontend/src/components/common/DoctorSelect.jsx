import Select from "../ui/Select";

// Shows a doctor dropdown only when the clinic has more than one doctor.
export default function DoctorSelect({ doctors = [], value, onChange, className }) {
  if (doctors.length < 2) return null;
  const options = doctors.map((d) => ({
    value: d._id,
    label: d.name + (d.specialization ? " — " + d.specialization : ""),
  }));
  return (
    <div className={className}>
      <Select label="Doctor" value={value || ""} onChange={(e) => onChange(e.target.value)} options={options} />
    </div>
  );
}
