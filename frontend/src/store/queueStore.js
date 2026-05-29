import { create } from "zustand";

export const useQueueStore = create((set) => ({
  queue: null,
  setQueue: (queue) => set({ queue }),
  clearQueue: () => set({ queue: null }),
}));
