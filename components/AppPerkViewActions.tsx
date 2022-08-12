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
import { Bookmark, DotsVertical, Share, Link as LinkIcon, MessageReport  } from "tabler-icons-react";

type Props = {
  perkName: string;
};
function AppPerkViewActions({ perkName }: Props) {
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
          <Text sx={{flexGrow: 1}}>{perkName}</Text>
          <Button>Claim</Button>
          <ActionIcon variant="transparent" onClick={() => setOpenedActions(true)}>
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
          <NavLink label="Share" icon={<Share size={16} />} />
          <NavLink label="Copy url" icon={<LinkIcon size={16} />} />
          <NavLink label="Report abuse" icon={<MessageReport size={16} />} />
        </Box>
      </Drawer>
    </>
  );
}

export default AppPerkViewActions;
