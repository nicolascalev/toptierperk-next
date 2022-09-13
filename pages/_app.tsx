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
import Router, { useRouter } from "next/router";
import { NotificationsProvider } from "@mantine/notifications";
import { UserInterfaceProvider } from "helpers/useUserInterfaceContext";
import { Sun, MoonStars } from "tabler-icons-react";
import { UserProvider } from "@auth0/nextjs-auth0";
import BottomNavigation from "components/BottomNavigation";
import AppLogo from "components/AppLogo";
import AppNavigation from "components/AppNavigation";
import AppHeader from "components/AppHeader";
import { SWRConfig } from "swr";
import NProgress from 'nprogress';
import 'styles/Nprogress.css';
import AppDesktopAlertModal from "components/AppDesktopAlertModal";

NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start()); 
Router.events.on('routeChangeComplete', () => NProgress.done()); 
Router.events.on('routeChangeError', () => NProgress.done());

export default function App(props: AppProps) {
  const router = useRouter();

  const { Component, pageProps } = props;

  const [opened, setOpened] = useState(false);

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
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
          />
        </Head>

        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            colors: {
              brand: [
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
            primaryColor: "brand",
          }}
        >
          <SWRConfig
            value={{
              // disable retry for some of these
              onErrorRetry: (error) => {
                // Never retry on 404.
                if (error.status === 404) return;
                // Never retry on 403.
                if (error.status === 403) return;
                // Never retry on 403.
                if (error.status === 401) return;
              },
            }}
          >
            <UserInterfaceProvider>
              <NotificationsProvider position="bottom-center">
                <AppShell
                  styles={{
                    body: { minHeight: "100vh" },
                  }}
                  padding={0}
                  header={
                    <AppHeader
                      openedNavigation={opened}
                      setOpenedNavigation={setOpened}
                    />
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

                <AppDesktopAlertModal />
              </NotificationsProvider>
            </UserInterfaceProvider>
          </SWRConfig>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
