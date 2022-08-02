import "../styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";
import { useState, useEffect } from "react";
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
  Button,
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
  const toggleColorScheme = (value?: ColorScheme) => {
    const theme = value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(theme);
    localStorage.setItem("color-scheme", theme);
  };
  useEffect(() => {
    const storedTheme = localStorage.getItem(
      "color-scheme"
    ) as ColorScheme | null;
    if (storedTheme) {
      const parsedTheme: ColorScheme = storedTheme;
      setColorScheme(parsedTheme);
    } else {
      localStorage.setItem("color-scheme", "light");
    }
  }, []);

  useEffect(() => {
    setOpened(false);
  }, [router.pathname]);

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
            // loader: "dots",
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
                    {/* <ActionIcon
                      onClick={() => toggleColorScheme()}
                      title="Toggle scheme"
                    >
                      {isDark ? <Sun /> : <MoonStars />}
                    </ActionIcon> */}
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
              padding="md"
            >
              <ScrollArea style={{ height: 282 }}>
                <Box>
                  <Link href="/company/admin" passHref>
                    <NavLink
                      component="a"
                      variant="subtle"
                      label="Your company"
                      icon={<BuildingSkyscraper size={14} />}
                      active={router.pathname == "/company/admin"}
                    />
                  </Link>
                  <Link href="/scan/costumer" passHref>
                    <NavLink
                      component="a"
                      variant="subtle"
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
                  <Button
                    fullWidth
                    color={isDark ? "primary" : "dark"}
                    onClick={() => toggleColorScheme()}
                    rightIcon={isDark ? <Sun /> : <MoonStars />}
                  >
                    Toggle theme
                  </Button>
                </Box>
              </ScrollArea>
            </Drawer>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
