import { createContext, ReactNode, useContext, useState } from "react";

type authContextType = {
  headerTitle: string;
  setHeaderTitle: any;
};
const UserInterfaceContext = createContext<authContextType>({
  headerTitle: "Toptierperk",
  setHeaderTitle: () => {},
});

export function UserInterfaceProvider({ children }: { children: ReactNode }) {
  const [headerTitle, setHeaderTitle] = useState("Toptierperk");
  const value = {
    headerTitle,
    setHeaderTitle,
  };
  return (
    <>
      <UserInterfaceContext.Provider value={value}>
        {children}
      </UserInterfaceContext.Provider>
    </>
  );
}

export function useUserInterfaceContext(): authContextType {
  return useContext(UserInterfaceContext);
}
