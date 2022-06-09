import { Paper, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { SmartHome, Scan, BuildingSkyscraper, User } from "tabler-icons-react";

export default function BottomNavigation(props: any) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  const bottomNavigationStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: dark ? "1px solid #2C2E33" : "1px solid #e9ecef",
  };

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
         color="primary" variant="transparent"
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
        >
          <SmartHome />
        </ActionIcon>
        <ActionIcon
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
        >
          <Scan />
        </ActionIcon>
        <ActionIcon
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
        >
          <BuildingSkyscraper />
        </ActionIcon>
        <ActionIcon
          style={{ width: "100%" }}
          sx={(theme) => ({ margin: theme.spacing.xs })}
        >
          <User />
        </ActionIcon>
      </div>
    </Paper>
  );
}
