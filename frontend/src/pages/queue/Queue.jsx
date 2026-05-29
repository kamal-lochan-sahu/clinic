import { useAuthStore } from "../../store/authStore";
import { useQueue, useCallNext } from "../../hooks/useQueue";
import { queueService } from "../../services/queue.service";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { Users, ChevronRight, SkipForward, CheckCircle, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function Queue() {
  const { user } = useAuthStore();
  const { data: queue, isLoading } = useQueue(user?._id);
  const callNext = useCallNext();
  const queryClient = useQueryClient();

  const handleCallNext = () => {
    const hasWaiting = queue?.waiting?.length > 0;
    const hasInProgress = queue?.inProgress;
    if (!hasWaiting && !hasInProgress) {
      toast("No more patients scheduled for today", { icon: "📋" });
      return;
    }
    callNext.mutate({ doctorId: user?._id, date: new Date().toISOString() });
  };

  const handleSkip = async (tokenId) => {
    try {
      await queueService.updateTokenStatus(tokenId, "skipped");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Patient token skipped");
    } catch {}
  };

  if (isLoading) return <Loader text="Loading queue..." />;

  const allDone = queue?.totalTokens > 0 && queue?.waiting?.length === 0 && !queue?.inProgress;
  const noPatients = !queue || queue?.totalTokens === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Queue Management</h2>
          <p className="text-sm text-gray-500">
            {noPatients ? "No appointments today" : queue?.totalTokens + " total · " + queue?.completed?.length + " completed · " + queue?.waiting?.length + " waiting"}
          </p>
        </div>
        <Button onClick={handleCallNext} loading={callNext.isPending} disabled={allDone || noPatients}>
          <ChevronRight size={16} />
          {allDone ? "All Done Today" : "Call Next Patient"}
        </Button>
      </div>

      {allDone && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">All patients attended for today!</p>
            <p className="text-sm text-green-600">{queue?.completed?.length} patients seen successfully</p>
          </div>
        </div>
      )}

      {noPatients && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-gray-400 flex-shrink-0" />
          <p className="text-gray-500">No appointments booked for today. Book appointments first.</p>
        </div>
      )}

      {!noPatients && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={"rounded-2xl p-6 text-center " + (queue?.inProgress ? "bg-primary-500 text-white" : allDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500")}>
            <p className={"text-sm font-medium " + (queue?.inProgress ? "text-primary-100" : allDone ? "text-green-100" : "text-gray-400")}>
              {allDone ? "Session Complete" : queue?.inProgress ? "Now Serving" : "Waiting to Start"}
            </p>
            <p className="text-6xl font-bold mt-2">{allDone ? "✓" : queue?.currentToken || "-"}</p>
            {queue?.inProgress && <p className="text-sm mt-2 text-primary-100">{queue.inProgress.patientId?.name}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-gray-500 text-sm font-medium">Waiting</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{queue?.waiting?.length || 0}</p>
            <p className="text-gray-400 text-xs mt-1">patients in queue</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-gray-500 text-sm font-medium">Est. Wait</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{(queue?.waiting?.length || 0) * 15}</p>
            <p className="text-gray-400 text-xs mt-1">minutes approx.</p>
          </div>
        </div>
      )}

      {queue?.inProgress && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">{queue.inProgress.tokenNumber}</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{queue.inProgress.patientId?.name || "Patient"}</p>
            <p className="text-xs text-gray-500">{queue.inProgress.patientId?.patientId} · Currently in consultation</p>
          </div>
          <Badge variant="info">In Progress</Badge>
        </div>
      )}

      {queue?.waiting?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary-500" />
            Waiting Patients ({queue.waiting.length})
          </h3>
          <div className="space-y-2">
            {queue.waiting.map((token, idx) => (
              <div key={token._id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " + (idx === 0 ? "bg-primary-100" : "bg-gray-100")}>
                  <span className={"font-bold " + (idx === 0 ? "text-primary-600" : "text-gray-500")}>{token.tokenNumber}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{token.patientId?.name || "Patient"}</p>
                  <p className="text-xs text-gray-400">{token.patientId?.patientId} · Est. wait: {(idx + 1) * 15} min</p>
                </div>
                {idx === 0 && <Badge variant="warning">Next</Badge>}
                <button onClick={() => handleSkip(token._id)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <SkipForward size={14} />Skip
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue?.completed?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Completed Today ({queue.completed.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {queue.completed.map((token) => (
              <div key={token._id} className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1.5">
                <span className="text-green-600 font-semibold text-sm">#{token.tokenNumber}</span>
                <span className="text-green-700 text-xs">{token.patientId?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
