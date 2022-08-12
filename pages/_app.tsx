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
  Text,
  Group,
  Button,
} from "@mantine/core";
import { useRouter } from "next/router";
import { NotificationsProvider } from "@mantine/notifications";
import { Sun, MoonStars } from "tabler-icons-react";

import BottomNavigation from "components/BottomNavigation";

import { UserProvider } from "@auth0/nextjs-auth0";
import AppLogo from "components/AppLogo";
import AppNavigation from "components/AppNavigation";

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
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            colors: {
              "brand": [
                "#e7effc",
                "#b8d0f5",
                "#89b1ef",
                "#5a92e9",
                "#4282e5",
                "#2b73e2",
                "#1363df",
                "#0f4fb2",
                "#0d459c",
                "#0b3b86",
              ],
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
            primaryColor: 'brand',
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
              title={
                <Group>
                  <AppLogo />
                  <Text size="lg" weight={700}>
                    Toptierperk
                  </Text>
                </Group>
              }
              padding="md"
            >
              <AppNavigation>
                <Button
                  fullWidth
                  color={isDark ? "primary" : "dark"}
                  onClick={() => toggleColorScheme()}
                  rightIcon={isDark ? <Sun /> : <MoonStars />}
                >
                  Toggle theme
                </Button>
              </AppNavigation>
            </Drawer>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
