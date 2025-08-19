/* eslint-disable react-refresh/only-export-components */
// context/EducatorContext.jsx
import { createContext, useState, useContext } from "react";

const EducatorContext = createContext();

export function EducatorProvider({ children }) {
  const [educator, setEducator] = useState(null);

  return (
    <EducatorContext.Provider value={{ educator, setEducator }}>
      {children}
    </EducatorContext.Provider>
  );
}

export function useEducator() {
  return useContext(EducatorContext);
}
