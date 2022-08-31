import QrScanner from "qr-scanner";
import { useRef, useEffect, useState } from "react";
import {
  Text,
  Button,
  AspectRatio,
  Box,
  useMantineTheme,
  Center,
  Group,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { Bulb, CaretDown, Scan } from "tabler-icons-react";

type Camera = {
  value: string;
  label: string;
};

interface Props {
  onReadSuccess: (result: any) => void;
  disabled?: boolean;
}
function AppCodeScanner({ onReadSuccess, disabled }: Props) {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const backgroundColor = isDark ? theme.colors.dark[6] : theme.colors.gray[0];

  const videoElement = useRef(null);
  const scanner: any = useRef(null);
  const [scanStarted, setscanStarted] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [hasFlash, setHasFlash] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scanButtonText, setScanButtonText] = useState("Start Scan");
  useEffect(() => {
    async function check() {
      const hasCameraCheck: boolean = await QrScanner.hasCamera();
      setHasCamera(hasCameraCheck);
    }
    check();
  }, []);

  // init scanner and destroy on useEffect
  useEffect(() => {
    if (videoElement.current) {
      scanner.current = new QrScanner(
        videoElement.current,
        (result: any) => {
          onReadSuccess(result.data);
          if (!scanner.current) return;
          stopScan();
          setscanStarted(false);
        },
        {
          maxScansPerSecond: 5,
        }
      );
    }
    return () => {
      scanner.current = null;
      setscanStarted(false);
    };
  }, [videoElement, onReadSuccess]);

  async function startScan() {
    if (!scanner.current) return;
    setScanButtonText("Loading...");
    await scanner.current.start();
    const deviceHasFlash = await scanner.current.hasFlash();
    setHasFlash(deviceHasFlash);
    const listedCameras = await QrScanner.listCameras(true);
    const foundCameras: Camera[] = listedCameras.map((cam: any) => ({
      value: cam.id,
      label: cam.label,
    }));
    if (listedCameras.length > 0) {
      scanner.current.setCamera(listedCameras[0].id);
    }
    setCameras(foundCameras);
    setscanStarted(true);
  }

  function stopScan() {
    if (!scanner.current) return;
    scanner.current.stop();
    setscanStarted(false);
    setScanButtonText("Start Scan");
  }

  async function toggleFlash() {
    await scanner.current.toggleFlash();
  }

  return (
    <Box sx={{ position: "relative", width: "100%", backgroundColor }}>
      <AspectRatio ratio={3 / 4} sx={{ width: "100%" }}>
        <video ref={videoElement} style={{ width: "100%" }}></video>
      </AspectRatio>
      {!scanStarted && (
        <Center
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0px",
            left: "0px",
          }}
        >
          <Group position="center">
            <Button
              onClick={startScan}
              disabled={!hasCamera || disabled}
              leftIcon={<Scan size={16} />}
            >
              {hasCamera ? scanButtonText : "No camera available"}
            </Button>
            <Text pl="md" pr="md" color="dimmed" size="sm" align="center">
              All Toptierperk QR codes will work with any QR scanner
            </Text>
          </Group>
        </Center>
      )}
      {scanStarted && (
        <Group
          align="center"
          position="apart"
          p="md"
          sx={{ width: "100%", position: "absolute", top: "0px" }}
        >
          <Button onClick={stopScan} variant="default">
            Stop Scan
          </Button>
          <Group>
            {hasFlash && (
              <ActionIcon title="Flash" onClick={toggleFlash}>
                <Bulb />
              </ActionIcon>
            )}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button rightIcon={<CaretDown size={16} />}>Camera</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Cameras</Menu.Label>
                {cameras.map((cam) => (
                  <Menu.Item
                    key={cam.value}
                    onClick={() => scanner.current.setCamera(cam.value)}
                  >
                    {cam.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      )}
    </Box>
  );
}

export default AppCodeScanner;
