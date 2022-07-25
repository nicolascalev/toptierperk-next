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
  Stack,
  Anchor,
  createStyles,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import {
  Scan,
  Sun,
  MoonStars,
  Logout,
  BuildingSkyscraper,
} from "tabler-icons-react";

import BottomNavigation from "../components/BottomNavigation";

import { UserProvider } from "@auth0/nextjs-auth0";

const useStyles = createStyles((theme) => ({
  collectionLink: {
    display: "block",
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    textDecoration: "none",
    borderRadius: theme.radius.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    lineHeight: 1,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
}));

export default function App(props: AppProps) {
  const { classes } = useStyles();

  const { Component, pageProps } = props;

  const [opened, setOpened] = useState(false);
  const title = opened ? "Close navigation" : "Open navigation";

  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  const dark = colorScheme === "dark";

  const theme = useMantineTheme();

  return (
    <UserProvider>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <Head>
          <title>Page title</title>
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
                body: { minHeight: "100vh", paddingTop: "50px" },
              }}
              padding={0}
              header={
                <Header
                  height={50}
                  p="xs"
                  style={{ borderBottom: "none" }}
                  fixed
                >
                  <Burger
                    size={14}
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    title={title}
                  />
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
                <Stack justify="flex-start" spacing="xs">
                  <Anchor
                    href="/company/admin"
                    underline={false}
                    className={classes.collectionLink}
                  >
                    <BuildingSkyscraper size={14} style={{ marginRight: 9 }} />
                    Your company
                  </Anchor>
                  <Anchor
                    href="/company/scan-costumer"
                    underline={false}
                    className={classes.collectionLink}
                  >
                    <Scan size={14} style={{ marginRight: 9 }} />
                    Verify Costumer QR
                  </Anchor>
                  <Anchor
                    underline={false}
                    className={classes.collectionLink}
                    onClick={() => toggleColorScheme()}
                  >
                    {dark ? (
                      <Sun size={14} style={{ marginRight: 9 }} />
                    ) : (
                      <MoonStars size={14} style={{ marginRight: 9 }} />
                    )}
                    Toggle theme
                  </Anchor>
                  <Anchor
                    href="/api/auth/logout"
                    component="a"
                    underline={false}
                    className={classes.collectionLink}
                  >
                    <Logout size={14} style={{ marginRight: 9 }} />
                    Logout
                  </Anchor>
                </Stack>
              </ScrollArea>
            </Drawer>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
