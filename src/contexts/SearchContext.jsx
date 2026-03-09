import { createContext, useContext, useState } from "react";

const SearchContext = createContext({});

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const clearSearch = () => setSearchTerm("");

  const value = {
    searchTerm,
    setSearchTerm,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
