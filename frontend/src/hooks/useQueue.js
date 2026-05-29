import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "../services/queue.service";
import toast from "react-hot-toast";

export const useQueue = (doctorId) => {
  return useQuery({
    queryKey: ["queue", doctorId],
    queryFn: () => queueService.getTodayQueue(doctorId).then((r) => r.data.data),
    enabled: !!doctorId,
    refetchInterval: 5000,
  });
};

export const useCallNext = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: queueService.callNext,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (res.data.data?.noMorePatients) {
        toast("All patients attended for today!", { icon: "✅" });
      } else {
        toast.success("Next patient called!");
      }
    },
    onError: () => toast.error("Failed to call next patient"),
  });
};
