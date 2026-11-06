import { createContext, useContext } from 'react';
export const SharedContext = createContext(null);
export const useSharedContext = () => useContext(SharedContext);
