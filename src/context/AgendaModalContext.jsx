import { createContext, useCallback, useContext, useState } from "react";
import AgendaModal from "../components/AgendaModal";

const AgendaModalContext = createContext(null);

export function AgendaModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <AgendaModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AgendaModal isOpen={isOpen} onClose={closeModal} />
    </AgendaModalContext.Provider>
  );
}

export function useAgendaModal() {
  const ctx = useContext(AgendaModalContext);
  if (!ctx) {
    throw new Error("useAgendaModal debe usarse dentro de AgendaModalProvider");
  }
  return ctx;
}
