import type { NextPage } from "next";
import {
  useMantineTheme,
  Text,
  Box,
  Input,
  Group,
  ActionIcon,
  Loader,
  Center,
  Drawer,
  Stack,
  SegmentedControl,
  Select,
} from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "../components/AppPerkCard";
import { useState } from "react";
import { DatePicker } from "@mantine/dates";

type PrivacyType = "all" | "private" | "public";

const Home: NextPage = () => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const filterBackground = isDark ? theme.colors.dark[7] : theme.white;
  const feedBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

  const [openedFilters, setOpenedFilters] = useState(false);
  const [perks, setPerks] = useState([]);

  const privacyOptions = [
    { label: "All", value: "all" },
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
  ];
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyType>("all");
  function getIsPrivate(value: PrivacyType) {
    if (value == "private") {
      return true;
    }
    if (value == "public") {
      return false;
    }
    return undefined;
  }
  const isPrivate: undefined | boolean = getIsPrivate(selectedPrivacy);

  return (
    <Box>
      <Group
        p="md"
        sx={{
          position: "sticky",
          top: "50px",
          backgroundColor: filterBackground,
        }}
      >
        <Input
          variant="default"
          placeholder="Search available perks"
          style={{ flexGrow: 1 }}
        />
        <ActionIcon title="Open filters" onClick={() => setOpenedFilters(true)}>
          <Filter></Filter>
        </ActionIcon>
      </Group>
      <Box p="md" sx={{ backgroundColor: feedBackground, minHeight: "90vh" }}>
        {/* <Center><Loader size="sm" /></Center> */}
      </Box>

      <Drawer
        opened={openedFilters}
        onClose={() => setOpenedFilters(false)}
        title="Filters"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Stack spacing="sm">
          <Box sx={{ width: "100%" }}>
            <Text weight={500} size="sm" mb={1}>
              Privacy
            </Text>
            <SegmentedControl
              sx={{ width: "100%" }}
              value={selectedPrivacy}
              onChange={(val: PrivacyType) => setSelectedPrivacy(val)}
              data={privacyOptions}
            />
          </Box>
          <Select
            label="Category"
            placeholder="Select category"
            nothingFound="Not found"
            clearable
            data={[]}
            value=""
          />
          <DatePicker
            placeholder="Pick date"
            label="Available on"
            description="Find perks that will be available on a certain day"
            minDate={new Date()}
          />
        </Stack>
      </Drawer>
    </Box>
  );
};

export default Home;
