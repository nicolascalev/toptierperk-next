import { Paper, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { SmartHome, Scan, BuildingSkyscraper, User } from "tabler-icons-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function BottomNavigation(props: any) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const bottomNavigationStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: dark ? "1px solid #2C2E33" : "1px solid #e9ecef",
  };

  const router = useRouter();
  const [activeLink, setActiveLink] = useState("/");
  function navigate(to: string) {
    router.push(to);
    setActiveLink(to);
  }

  return (
    <Paper
      shadow="sm"
      style={{
        position: "fixed",
        bottom: "0px",
        width: "100%",
      }}
    >
      <div style={bottomNavigationStyles}>
        <ActionIcon
          color={activeLink == "/" ? "primary" : undefined}
          variant={activeLink == "/" ? "transparent" : undefined}
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
          onClick={() => navigate("/")}
        >
          <SmartHome />
        </ActionIcon>
        <ActionIcon
          color={activeLink == "/scan" ? "primary" : undefined}
          variant={activeLink == "/scan" ? "transparent" : undefined}
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
          onClick={() => navigate("/scan")}
        >
          <Scan />
        </ActionIcon>
        <ActionIcon
          color={activeLink == "/company" ? "primary" : undefined}
          variant={activeLink == "/company" ? "transparent" : undefined}
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
          onClick={() => navigate("/company")}
        >
          <BuildingSkyscraper />
        </ActionIcon>
        <ActionIcon
          color={activeLink == "/profile" ? "primary" : undefined}
          variant={activeLink == "/profile" ? "transparent" : undefined}
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
          onClick={() => navigate("/profile")}
        >
          <User />
        </ActionIcon>
      </div>
    </Paper>
  );
}
