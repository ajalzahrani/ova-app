import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OccurrenceSearchState {
  // State
  searchParams: {
    search?: string;
    status?: string;
    severity?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    mrn?: string;
    page?: string;
    pageSize?: string;
  };

  // Actions
  setSearchParams: (
    params: Partial<OccurrenceSearchState["searchParams"]>
  ) => void;
  resetSearchParams: () => void;
}

export const useOccurrenceSearchStore = create<OccurrenceSearchState>()(
  persist(
    (set) => ({
      // Initial state
      searchParams: {},

      // Actions
      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      resetSearchParams: () => set({ searchParams: {} }),
    }),
    {
      name: "occurrence-search-storage",
    }
  )
);
