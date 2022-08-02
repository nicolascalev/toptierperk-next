import { Center, Group, Text, Divider } from "@mantine/core";

export default function Error({
  status,
  message,
}: {
  status: number;
  message: string;
}) {
  return (
    <Center p="lg" sx={{ height: "calc(100vh - 100px)" }}>
      <Group position="center" sx={{ width: "100%", flexWrap: "nowrap" }}>
        <Group sx={{ flexWrap: "nowrap" }}>
          <Text size="xl" weight={500}>
            {status}
          </Text>
          <Divider sx={{ height: "48px" }} orientation="vertical" />
        </Group>
        <Text>{message}</Text>
      </Group>
    </Center>
  );
}
