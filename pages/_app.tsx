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
  ActionIcon,
  useMantineTheme,
} from "@mantine/core";
import { User, Sun, MoonStars } from "tabler-icons-react";

import BottomNavigation from "../components/BottomNavigation";

import { UserProvider } from "@auth0/nextjs-auth0";

const useStyles = createStyles((theme) => ({
  collectionLink: {
    display: "block",
    padding: `8px ${theme.spacing.xs}px`,
    textDecoration: "none",
    borderRadius: theme.radius.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    lineHeight: 1,
    fontWeight: 500,

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
          }}
        >
          <AppShell
            styles={{
              body: { minHeight: "100vh", paddingTop: "50px" },
            }}
            padding={0}
            header={
              <Header height={50} p="xs" style={{ borderBottom: "none" }} fixed>
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
                  href="https://mantine.dev/"
                  target="_blank"
                  component="a"
                  underline={false}
                  className={classes.collectionLink}
                >
                  <User size={14} style={{ marginRight: 9 }} />
                  Home
                </Anchor>
                <Anchor
                  href="https://mantine.dev/"
                  target="_blank"
                  component="a"
                  underline={false}
                  className={classes.collectionLink}
                >
                  <User size={14} style={{ marginRight: 9 }} />
                  Casa
                </Anchor>

                <ActionIcon
                  variant="outline"
                  color={dark ? "yellow" : "blue"}
                  onClick={() => toggleColorScheme()}
                  title="Toggle color scheme"
                >
                  {dark ? <Sun size={18} /> : <MoonStars size={18} />}
                </ActionIcon>
              </Stack>
            </ScrollArea>
          </Drawer>
        </MantineProvider>
      </ColorSchemeProvider>
    </UserProvider>
  );
}
