import type { NextPage } from "next";
import { useMantineTheme, Input, Group, ActionIcon, Paper } from "@mantine/core";
// import { Filter } from "tabler-icons-react";

const Profile: NextPage = () => {
  const theme = useMantineTheme();

  return (
    <div>
      <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.blue[7], position: "relative" }}>
        <h2>Profile</h2>

        <Paper p="md" shadow="sm" style={{ position: "absolute", right: theme.spacing.md, left: theme.spacing.md }}>
          <p>uno</p>
        </Paper>
      </div>
    </div>
  );
};

export default Profile;
