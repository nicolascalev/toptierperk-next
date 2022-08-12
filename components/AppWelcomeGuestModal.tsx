import { useState, useEffect } from "react";
import { Modal, Button, Group, Text, Stack, Box, List } from "@mantine/core";
import { useUser } from "@auth0/nextjs-auth0";
import AppLogo from "components/AppLogo";

function AppWelcomeGuestModal() {
  const { user, isLoading } = useUser();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setOpened(true);
      } else {
        setOpened(false);
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <Stack align="center" spacing="xs">
          <AppLogo height={64} />
          <Text size="xl" weight={700}>
            Toptierperk
          </Text>
        </Stack>
        <Box my="xl">
          <List size="sm">
            <List.Item>Find perks your employer has for you</List.Item>
            <List.Item>Offer your own perks</List.Item>
            <List.Item>Check if you have a perk at any location quickly</List.Item>
            <List.Item>Keep your employees updated about their benefits in one place</List.Item>
          </List>
        </Box>
        <Group grow>
          <Button variant="default" onClick={() => setOpened(false)}>
            Close
          </Button>
          <Button component="a" href="/api/auth/login">Singup</Button>
        </Group>
      </Modal>
    </>
  );
}

export default AppWelcomeGuestModal;
