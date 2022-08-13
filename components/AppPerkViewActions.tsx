import { useEffect, useState, useRef } from "react";
import {
  Box,
  Divider,
  Group,
  useMantineTheme,
  Text,
  ActionIcon,
  Button,
  Drawer,
  NavLink,
} from "@mantine/core";
import {
  Bookmark,
  DotsVertical,
  Share,
  Link as LinkIcon,
  MessageReport,
} from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";

type Props = {
  perk: any;
};
function AppPerkViewActions({ perk }: Props) {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const componentRef = useRef<any>(null);
  const [actionsHeight, setActionsHeight] = useState(49);

  const [openedActions, setOpenedActions] = useState(false);

  useEffect(() => {
    if (componentRef.current?.offsetHeight) {
      setActionsHeight(componentRef.current.offsetHeight);
    }
  }, []);

  function clickShare() {
    const shareData = {
      title: perk.name,
      text: "Toptierperk, making B2B perks available for everyone",
      url: window.location.origin + `/perk${perk.id}`,
    };
    navigator
      .share(shareData)
      .then(() => {
        showNotification({
          title: "Shared",
          message: "Thanks for sharing this perk!",
          autoClose: 3000,
        });
      })
      .catch(() => {
        showNotification({
          title: "Not available",
          message: "Sharing is not available for your browser",
          autoClose: 3000,
        });
      })
      .finally(() => setOpenedActions(false));
  }

  function clickCopyUrl() {
    navigator.clipboard
      .writeText(window.location.origin + `/perk${perk.id}`)
      .then(() => {
        showNotification({
          title: "Copied",
          message: "Url copied to keyboard",
          autoClose: 3000,
        });
      })
      .catch(() => {
        showNotification({
          title: "Oops",
          message: "Could not copy to keyboard",
          autoClose: 3000,
        });
      })
      .finally(() => setOpenedActions(false));
  }

  // TODO: get errors or validations from props, and disable claim or actions
  return (
    <>
      <div style={{ height: actionsHeight }}></div>
      <Box
        ref={componentRef}
        sx={{
          width: "100%",
          position: "fixed",
          bottom: "48px",
          backgroundColor: isDark ? theme.colors.dark[7] : "white",
        }}
      >
        <Divider />
        <Group p="md" align="top" noWrap spacing="xs">
          <Text sx={{ flexGrow: 1 }}>{perk.name}</Text>
          <Button>Claim</Button>
          <ActionIcon
            variant="transparent"
            onClick={() => setOpenedActions(true)}
          >
            <DotsVertical />
          </ActionIcon>
        </Group>
      </Box>

      <Drawer
        opened={openedActions}
        onClose={() => setOpenedActions(false)}
        padding="md"
        title="Actions"
        position="bottom"
      >
        <Box>
          <NavLink label="Save" icon={<Bookmark size={16} />} />
          <NavLink
            label="Share"
            icon={<Share size={16} />}
            onClick={clickShare}
          />
          <NavLink
            label="Copy url"
            icon={<LinkIcon size={16} />}
            onClick={clickCopyUrl}
          />
          <NavLink label="Report abuse" icon={<MessageReport size={16} />} />
        </Box>
      </Drawer>
    </>
  );
}

export default AppPerkViewActions;
