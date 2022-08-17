import { Text, Center, Box, Image, useMantineTheme } from "@mantine/core";
import QRCode from "react-qr-code";

interface Props {
  imageUrl: string;
  title: string;
  description: string;
  qrValue: string;
}

function AppCodeBox({ imageUrl, title, description, qrValue }: Props) {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const backgroundColor = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor,
        textAlign: "center",
        padding: theme.spacing.xl,
        borderRadius: theme.radius.sm,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
      }}
    >
      <div
        style={{
          width: "100%",
          position: "absolute",
          left: "0px",
          top: "-2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Image
          src={imageUrl}
          alt="QR code"
          imageProps={{
            style: {
              objectFit: "cover",
              border: `5px solid ${backgroundColor}`,
              width: "4rem",
              height: "4rem",
              borderRadius: "32px",
            },
          }}
        ></Image>
      </div>
      <Text weight={500} mt="sm">
        {title}
      </Text>
      <Text
        size="sm"
        color="dimmed"
        weight={500}
        pb="lg"
        style={{
          maxWidth: 200,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {description}
      </Text>
      <Center>
        <Box
          sx={(theme) => ({
            width: 150,
            height: 150,
            backgroundColor: "white",
            textAlign: "center",
            padding: theme.spacing.md,
            borderRadius: theme.radius.sm,
          })}
        >
          <QRCode value={qrValue} size={118} />
        </Box>
      </Center>
    </Box>
  );
}

export default AppCodeBox;
