import { useState, useEffect } from "react";
import { useViewportSize } from "@mantine/hooks";
import { useMantineTheme, Text, Modal, ThemeIcon, Center, Paper } from "@mantine/core";
import { Tools } from "tabler-icons-react";
import QRCode from "react-qr-code";

function AppDesktopAlertModal() {
  const theme = useMantineTheme();
  const { width: viewportWidth } = useViewportSize();
  const breakpointSm = theme.breakpoints.sm;
  let showModal = false;
  if (viewportWidth > breakpointSm) {
    showModal = true;
  }

  const [qrValue, setQrValue] = useState("");
  useEffect(() => {
    setQrValue(window.location.href);
  }, []);

  return (
    <Modal
      size="lg"
      opened={showModal}
      onClose={() => {}}
      closeOnEscape={false}
      closeOnClickOutside={false}
      withCloseButton={false}
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[5]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
    >
      <ThemeIcon size="xl" mb="sm">
        <Tools />
      </ThemeIcon>
      <Text size="xl" weight={500}>
        We are working on the desktop version
      </Text>
      <Text color="dimmed" mt="xl">
        We are sorry about the inconvenience, we are working to deliver the
        best user experience for you. In the meantime please open this same link
        in your mobile device
      </Text>
      <Center mt="md">
        <Paper radius="sm" p="md" pb="sm" style={{ backgroundColor: "white" }}>
          <QRCode value={qrValue} size={100} />
        </Paper>
      </Center>
    </Modal>
  );
}

export default AppDesktopAlertModal;
