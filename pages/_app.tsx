import "../styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import {
  ColorSchemeProvider,
  MantineProvider,
  ColorScheme,
  AppShell,
  Header,
  Burger,
  Drawer,
  Box,
  createStyles,
  ScrollArea,
  Group,
  ActionIcon,
  NavLink,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { NotificationsProvider } from "@mantine/notifications";
import {
  Scan,
  Sun,
  MoonStars,
  Logout,
  BuildingSkyscraper,
} from "tabler-icons-react";

import BottomNavigation from "components/BottomNavigation";

import { UserProvider } from "@auth0/nextjs-auth0";

export default function App(props: AppProps) {
  const router = useRouter();

  const { Component, pageProps } = props;

  const [opened, setOpened] = useState(false);
  const title = opened ? "Close navigation" : "Open navigation";

  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const isDark = colorScheme === "dark";

  return (
    <UserProvider>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <Head>
          <title>Toptierperk, B2B perks available for all size business</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>

        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
            colors: {
              "bright-yellow": [
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
                "#FFD43B",
              ],
            },
            loader: "dots",
          }}
        >
          <NotificationsProvider position="bottom-center">
            <AppShell
              styles={{
                body: { minHeight: "100vh" },
              }}
              padding={0}
              header={
                <Header
                  height={50}
                  p="xs"
                  style={{ borderBottom: "none" }}
                  fixed
                >
                  <Group position="apart">
                    <Burger
                      size={14}
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      title={title}
                    />
                    <ActionIcon
                      onClick={() => toggleColorScheme()}
                      title="Toggle scheme"
                    >
                      {isDark ? <Sun /> : <MoonStars />}
                    </ActionIcon>
                  </Group>
                </Header>
              }
            >
              <Component {...pageProps} />
            </AppShell>
            <BottomNavigation />
            <Drawer
              position="bottom"
              opened={opened}
              onClose={() => setOpened(false)}
              title="Toptierperk"
              padding="xl"
            >
              <ScrollArea style={{ height: 250 }}>
                <Box>
                  <Link href="/company/admin" passHref>
                    <NavLink
                      component="a"
                      label="Your company"
                      icon={<BuildingSkyscraper size={14} />}
                      active={router.pathname == "/company/admin"}
                    />
                  </Link>
                  <Link href="/scan/costumer" passHref>
                    <NavLink
                      component="a"
                      label="Verify Costumer QR"
                      icon={<Scan size={14} />}
                      active={router.pathname == "/scan/costumer"}
                    />
                  </Link>
                  <Link href="/api/auth/logout" passHref>
                    <NavLink
                      variant="filled"
                      color="red"
                      component="a"
                      label="Logout"
                      icon={<Logout size={14} />}
                    />
                  </Link>
                </Box>
              </ScrollArea>
            </Drawer>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
