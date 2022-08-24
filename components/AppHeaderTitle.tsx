import { useUserInterfaceContext } from "helpers/useUserInterfaceContext";
import { useEffect } from "react";

function AppHeaderTitle({ title }: { title: string }) {
  const { setHeaderTitle } = useUserInterfaceContext();
  useEffect(() => {
    setHeaderTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default AppHeaderTitle;
