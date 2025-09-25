import React, { createContext, useContext, useState } from "react";

const SelectorContext = createContext();

export const useSelectorContext = () => {
  const context = useContext(SelectorContext);
  if (!context) {
    throw new Error(
      "useSelectorContext must be used within a SelectorProvider"
    );
  }
  return context;
};

export const SelectorProvider = ({ children }) => {
  const [openSelectorId, setOpenSelectorId] = useState(null);

  const openSelector = (id) => {
    setOpenSelectorId(id);
  };

  const closeSelector = () => {
    setOpenSelectorId(null);
  };

  const isSelectorOpen = (id) => {
    return openSelectorId === id;
  };

  return (
    <SelectorContext.Provider
      value={{
        openSelector,
        closeSelector,
        isSelectorOpen,
        openSelectorId,
      }}
    >
      {children}
    </SelectorContext.Provider>
  );
};
