import { create } from 'zustand';

interface useProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedTool: any;
  setSelectedTool: (tool: any) => void;
}

export const useProModal = create<useProModalStore>((set) => ({
  isOpen: false,
  selectedTool: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
}));

export default useProModal;
