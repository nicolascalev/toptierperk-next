import { Paper, ActionIcon, useMantineColorScheme, Divider } from "@mantine/core";
import { SmartHome, Scan, BuildingSkyscraper, User } from "tabler-icons-react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function BottomNavigation(props: any) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const bottomNavigationStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const router = useRouter();
  const links = [
    { url: "/", icon: <SmartHome /> },
    { url: "/scan/company", icon: <Scan /> },
    { url: "/company", icon: <BuildingSkyscraper /> },
    { url: "/profile", icon: <User /> },
  ]

  return (
    <Paper
      shadow="sm"
      style={{
        position: "fixed",
        bottom: "0px",
        width: "100%",
      }}
    >
      <Divider />
      <div style={bottomNavigationStyles}>
        {links.map((link: any, index) => (
          <Link key={index} href={link.url} passHref>
            <ActionIcon
              component="a"
              color={router.pathname === link.url ? "primary" : undefined}
              variant={router.pathname === link.url ? "transparent" : undefined}
              style={{ width: "100%" }}
              m="sx"
              sx={(theme) => ({ margin: theme.spacing.xs })}
            >
              {link.icon}
            </ActionIcon>
          </Link>
        ))}
      </div>
    </Paper>
  );
}
