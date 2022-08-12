import type { NextPage } from "next";
import {
  useMantineTheme,
  Text,
  Box,
  TextInput,
  Group,
  ActionIcon,
  Loader,
  Center,
  Drawer,
  Stack,
  SegmentedControl,
  Select,
  Indicator,
  Button,
} from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "components/AppPerkCard";
import AppMainLoader from "components/AppMainLoader";
import { useState, useEffect, useMemo } from "react";
import { DatePicker } from "@mantine/dates";
import useSWR from "swr";
import axios from "axios";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useDebouncedValue } from "@mantine/hooks";
import { isNull, pick } from "lodash";
import AppPrivacySelect from "components/AppPrivacySelect";
import AppCategorySelect from "components/AppCategorySelect";

const fetcher = (url: string, params: any) =>
  axios
    .get(url, {
      params,
    })
    .then((res) => res.data);

interface Props {
  user: any;
}
const now = new Date();

function PerkList({ perks }: { perks: any[] }) {
  return (
    <>
      {perks.map((perk: any) => (
        <AppPerkCard key={perk.id} perk={perk} />
      ))}
    </>
  );
}

const Home: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const filterBackground = isDark ? theme.colors.dark[7] : theme.white;
  const feedBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

  const [openedFilters, setOpenedFilters] = useState(false);
  const [perks, setPerks] = useState<any[]>([]);

  const [searchString, setSearchString] = useState("");
  const [debSearchString] = useDebouncedValue(searchString, 500);
  const [privacy, setPrivacy] = useState<undefined | boolean>(undefined);
  const [startsAt, setStartsAt] = useState<Date | undefined>(undefined);
  const [category, setCategory] = useState<undefined | any>(undefined);
  const [theresMore, setTheresMore] = useState(false);
  const [params, setParams] = useState<any>();
  const filters = useMemo(
    () => ({
      searchString: debSearchString,
      privacy: privacy,
      startsAt: startsAt,
      category: category?.value || undefined,
    }),
    [category, debSearchString, privacy, startsAt]
  );
  useEffect(() => {
    setPerks([]);
    setParams({
      ...filters,
      ...{
        take: 10,
        skip: 0,
        cursor: undefined,
        acquired: true,
      },
    });
  }, [filters]);
  function resetFilters() {
    setSearchString("");
    setPrivacy(undefined);
    setStartsAt(undefined);
    setCategory(undefined);
  }
  const { data, error } = useSWR<any[]>(
    user.company.id && params
      ? [`/api/company/${user.company.id}/benefits`, params]
      : null,
    fetcher
  );
  const isLoading = !data && !error;
  useEffect(() => {
    if (data) {
      setPerks((perks: any[]) => [...perks, ...data]);
    }
    if (data && data.length === 10) {
      setTheresMore(true);
    }
    if (data && data.length < 10) {
      setTheresMore(false);
    }
  }, [data]);

  function loadMore() {
    const newCursor = perks[perks.length - 1].id;
    setParams({
      ...filters,
      ...{
        take: 10,
        skip: 1,
        cursor: newCursor,
      },
    });
  }

  const hasActiveFilters = (): boolean => {
    const monitoredFilters = pick(filters, ["privacy", "startsAt", "category"]);
    if (
      Object.values(monitoredFilters)
        .map((val: any) => val !== "" && val !== undefined)
        .includes(true)
    ) {
      return true;
    }
    return false;
  };

  function onChangeDatePicker(value: null | Date) {
    if (isNull(value)) {
      setStartsAt(undefined);
      return;
    }
    setStartsAt(value);
  }

  return (
    <Box pb={49}>
      <Group
        p="md"
        sx={{
          position: "sticky",
          top: "50px",
          backgroundColor: filterBackground,
          zIndex: 10,
        }}
      >
        <TextInput
          value={searchString}
          onChange={(e: any) => setSearchString(e.currentTarget.value)}
          variant="default"
          placeholder="Search available perks"
          style={{ flexGrow: 1 }}
        />
        <Indicator disabled={!hasActiveFilters()}>
          <ActionIcon
            title="Open filters"
            onClick={() => setOpenedFilters(true)}
          >
            <Filter></Filter>
          </ActionIcon>
        </Indicator>
      </Group>

      <Box
        p="md"
        sx={{
          backgroundColor: feedBackground,
          minHeight: "calc(100vh - 166px)",
        }}
      >
        <PerkList perks={Array.from(new Set(perks))} />
        {isLoading && (
          <Center>
            <Loader variant="bars" size="sm"></Loader>
          </Center>
        )}
        {!isLoading && (
          <Button onClick={loadMore} disabled={!theresMore} fullWidth>
            {theresMore ? "Load More" : "Up to date"}
          </Button>
        )}
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
            <AppPrivacySelect value={privacy} onChange={setPrivacy} />
          </Box>
          <AppCategorySelect onChange={setCategory} value={category} />
          <DatePicker
            placeholder="Pick date"
            label="Available on"
            description="Find perks that will be available on a certain day"
            minDate={now}
            value={startsAt}
            onChange={onChangeDatePicker}
          />
          {hasActiveFilters() && (
            <Button onClick={resetFilters}>Clear filters</Button>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
};

export default Home;

export const getServerSideProps = withPageAuthRequired();
