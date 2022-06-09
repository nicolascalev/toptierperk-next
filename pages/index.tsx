import type { NextPage } from "next";
import { useMantineTheme, Input, Group, ActionIcon } from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "../components/AppPerkCard";

const Home: NextPage = () => {
  const theme = useMantineTheme();

  return (
    <div style={{ padding: theme.spacing.md, minHeight: "100vh"  }}>
      <h2>Home</h2>
      <Group style={{ marginBottom: theme.spacing.sm, position: "sticky" }}>
        <Input variant="default" placeholder="Search" style={{ flexGrow: 1 }} />
        <ActionIcon>
          <Filter></Filter>
        </ActionIcon>
      </Group>
      <AppPerkCard />
      <AppPerkCard />
    </div>
  );
};

export default Home;
