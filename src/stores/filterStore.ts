import { create } from 'zustand';

interface FilterState {
  year: number;
  channel: string;
  status: string;
  search: string;
  setYear: (year: number) => void;
  setChannel: (channel: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  year: new Date().getFullYear(),
  channel: '',
  status: '',
  search: '',

  setYear: (year) => set({ year }),
  setChannel: (channel) => set({ channel }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ year: new Date().getFullYear(), channel: '', status: '', search: '' }),
}));
