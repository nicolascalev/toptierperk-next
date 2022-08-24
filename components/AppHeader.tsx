import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Header, Burger, Text, Group, ActionIcon } from "@mantine/core";
import { ChevronLeft } from "tabler-icons-react";
import { useUserInterfaceContext } from "helpers/useUserInterfaceContext";

interface Props {
  openedNavigation: boolean;
  setOpenedNavigation: any;
}

const showMenuPaths = ["/", "/scan/business", "/business", "/profile"];
function AppHeader({ openedNavigation, setOpenedNavigation }: Props) {
  const { headerTitle } = useUserInterfaceContext();
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);
  useEffect(() => {
    if (window.history.length > 1) {
      setHasHistory(true);
    }
  }, []);
  const isShowMenuPath = showMenuPaths.includes(router.pathname) ? true : false;
  const title = openedNavigation ? "Close navigation" : "Open navigation";
  return (
    <Header height={50} p="xs" style={{ borderBottom: "none" }} fixed>
      <span style={{ position: "absolute", left: "10px", top: "10px" }}>
        {hasHistory && !isShowMenuPath ? (
          <ActionIcon color="dark" onClick={() => router.back()}>
            <ChevronLeft />
          </ActionIcon>
        ) : (
          <Burger
            size={14}
            opened={openedNavigation}
            onClick={() => setOpenedNavigation((o: boolean) => !o)}
            title={title}
          />
        )}
      </span>
      <Group position="center" align="center">
        <Text
          weight={500}
          style={{ height: "28px", display: "flex", alignItems: "center" }}
        >
          {headerTitle.substring(0, 25)}
        </Text>
      </Group>
    </Header>
  );
}

export default AppHeader;
