import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Plus, Upload, Eye } from "lucide-react";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PatientSearch from "../../components/patient/PatientSearch";
import { formatDate } from "../../utils/formatDate";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";

const statusConfig = {
  ordered: { label: "Ordered", variant: "info" },
  sample_collected: { label: "Sample Collected", variant: "warning" },
  processing: { label: "Processing", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
};

export default function LabTests() {
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { tests: [{ name: "", urgency: "routine", instructions: "" }] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "tests" });

  const { data, isLoading } = useQuery({
    queryKey: ["labtests", statusFilter],
    queryFn: () => api.get("/labtests", { params: { status: statusFilter || undefined } }).then(r => r.data.data),
  });

  const createLabTest = useMutation({
    mutationFn: (data) => api.post("/labtests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labtests"] });
      toast.success("Lab test ordered!");
      setShowModal(false);
      setSelectedPatient(null);
      reset();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to order lab test"),
  });

  const uploadReport = useMutation({
    mutationFn: ({ id, file }) => {
      const formData = new FormData();
      formData.append("report", file);
      return api.post("/labtests/" + id + "/upload-report", formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labtests"] });
      toast.success("Report uploaded successfully!");
      setShowUploadModal(false);
      setSelectedTest(null);
      setReportFile(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Upload failed"),
  });

  const onSubmit = (data) => {
    if (!selectedPatient) { toast.error("Please select a patient"); return; }
    createLabTest.mutate({ patientId: selectedPatient._id, tests: data.tests });
  };

  const labsList = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lab Tests</h2>
          <p className="text-sm text-gray-500">{labsList.length} total tests</p>
        </div>
        <Button onClick={() => { setShowModal(true); setSelectedPatient(null); reset(); }}>
          <Plus size={16} />Order Lab Test
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "All" },
          { value: "ordered", label: "Ordered" },
          { value: "processing", label: "Processing" },
          { value: "completed", label: "Completed" },
        ].map(s => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors " +
              (statusFilter === s.value ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? <Loader text="Loading lab tests..." /> : labsList.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No lab tests found"
          description="Order lab tests from OPD consultation or here"
          action={<Button onClick={() => setShowModal(true)}><Plus size={16} />Order Lab Test</Button>} />
      ) : (
        <div className="space-y-3">
          {labsList.map(test => {
            const cfg = statusConfig[test.status] || statusConfig.ordered;
            return (
              <div key={test._id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{test.patientId?.name || "Patient"}</p>
                      <span className="text-xs text-gray-400">{test.patientId?.patientId}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {test.tests?.map((t, i) => (
                        <span key={i} className={"text-xs px-2 py-0.5 rounded-full " +
                          (t.urgency === "urgent" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
                          {t.name} {t.urgency === "urgent" ? "⚡" : ""}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(test.createdAt)}</p>
                    {test.reportUrl && (
                      <a href={test.reportUrl} target="_blank" rel="noreferrer"
                        className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-1">
                        <Eye size={12} />View Report
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    {test.status !== "completed" && (
                      <button onClick={() => { setSelectedTest(test); setShowUploadModal(true); }}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
                        <Upload size={12} />Upload Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Lab Test Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setSelectedPatient(null); reset(); }}
        title="Order Lab Test" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <PatientSearch onSelect={setSelectedPatient} showQuickAdd={true} />
            {selectedPatient && (
              <div className="mt-2 bg-primary-50 rounded-lg p-2 text-sm">
                <strong>{selectedPatient.name}</strong> · {selectedPatient.patientId}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tests *</label>
              <Button type="button" size="sm" variant="secondary"
                onClick={() => append({ name: "", urgency: "routine", instructions: "" })}>
                <Plus size={12} />Add Test
              </Button>
            </div>
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                <div className="col-span-5">
                  <Input placeholder="Test name (e.g. CBC, LFT)" {...register("tests." + i + ".name", { required: true })} />
                </div>
                <div className="col-span-3">
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                    {...register("tests." + i + ".urgency")}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent ⚡</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <Input placeholder="Instructions" {...register("tests." + i + ".instructions")} />
                </div>
                <div className="col-span-1">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={createLabTest.isPending}>Order Tests</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Report Modal */}
      <Modal open={showUploadModal} onClose={() => { setShowUploadModal(false); setSelectedTest(null); setReportFile(null); }}
        title="Upload Lab Report">
        <div className="space-y-4">
          {selectedTest && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium">{selectedTest.patientId?.name}</p>
              <p className="text-xs text-gray-500">{selectedTest.tests?.map(t => t.name).join(", ")}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report File (PDF/Image) *</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setReportFile(e.target.files[0])}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button onClick={() => { if (reportFile && selectedTest) uploadReport.mutate({ id: selectedTest._id, file: reportFile }); }}
              loading={uploadReport.isPending} disabled={!reportFile}>
              <Upload size={16} />Upload Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
