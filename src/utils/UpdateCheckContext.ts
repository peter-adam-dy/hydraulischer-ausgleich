import { createContext, useContext } from 'react';

export interface UpdateCheckState {
  updateAvailable: boolean;
  checking: boolean;
  lastChecked: Date | null;
  checkForUpdate: () => Promise<void>;
  dismiss: () => void;
}

export const UpdateCheckContext = createContext<UpdateCheckState>({
  updateAvailable: false,
  checking: false,
  lastChecked: null,
  checkForUpdate: async () => {},
  dismiss: () => {},
});

export function useUpdateCheckContext() {
  return useContext(UpdateCheckContext);
}
