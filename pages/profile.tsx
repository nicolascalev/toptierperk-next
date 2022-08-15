import type { NextPage } from "next";
import {
  useMantineTheme,
  Center,
  Paper,
  Text,
  Box,
  Tabs,
} from "@mantine/core";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useWindowScroll } from "react-use";
import { useState, useEffect } from "react";
import AppUserForm from "components/AppUserForm";

function UserPicture(props: any) {
  const { y } = useWindowScroll();
  const [logoSize, setLogoSize] = useState(64);
  useEffect(() => {
    if (y < 300) {
      setLogoSize(64 - y);
    }
  }, [y]);

  return (
    <div
      className="logo__container"
      style={{ width: logoSize, height: logoSize }}
    >
      <div
        className="logo"
        style={{ backgroundImage: `url('${props.logo}')` }}
      ></div>
    </div>
  );
}

function Message({ title, message }: { title: string; message: string }) {
  return (
    <Paper withBorder p="md">
      <Text weight={500} mb="sm">
        {title}
      </Text>
      <Text color="dimmed" mb="sm">
        {message}
      </Text>
    </Paper>
  );
}

interface Props {
  user: any;
}

const Profile: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();

  const isDark = theme.colorScheme === "dark";

  const logoContainerBg = isDark ? theme.colors.dark[7] : theme.white;

  const tabListStyles: any = {
    position: "sticky",
    top: "114px",
    zIndex: 10,
    backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
    borderBottom: "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da"),
  };

  let tabPanelStyles: any = { minHeight: "calc(100vh - 301px)" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  return (
    <div style={{ position: "relative", marginBottom: "49px" }}>
      <Center
        p="xs"
        sx={{
          height: "64px",
          position: "sticky",
          top: "49px",
          zIndex: 11,
          backgroundColor: logoContainerBg,
        }}
      >
        <UserPicture
          logo={
            user.picture?.url ||
            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          }
        />
      </Center>
      <Box p="md">
        <Text align="center" size="lg">
          {user.name}
        </Text>
        <Text align="center" color="dimmed" size="xs">@{user.username}</Text>
      </Box>
      <Tabs variant="pills" color="primary" defaultValue="saved">
        <Tabs.List grow p="sm" sx={tabListStyles}>
          <Tabs.Tab value="saved">Saved</Tabs.Tab>
          <Tabs.Tab value="claims">Claims</Tabs.Tab>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="saved" pt="md" sx={tabPanelStyles}>
          <Box p="md">
            <Message
              title="No saved items"
              message="When you save perks they will be displayed here"
            />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="claims" pt="md" sx={tabPanelStyles}>
          <Box p="md">
            <Message
              title="No claims to show"
              message="When you claim perks they will be displayed here"
            />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="profile" pt="md" sx={tabPanelStyles}>
          <Box p="md">
            <AppUserForm user={user} />
          </Box>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Profile;

export const getServerSideProps = withPageAuthRequired();
