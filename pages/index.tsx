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
  Paper,
  Anchor,
} from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "components/AppPerkCard";
import { useState, useEffect, useMemo } from "react";
import { DatePicker } from "@mantine/dates";
import useSWR from "swr";
import api from "config/api";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useDebouncedValue } from "@mantine/hooks";
import { isNull, pick } from "lodash";
import AppPrivacySelect from "components/AppPrivacySelect";
import AppCategorySelect from "components/AppCategorySelect";
import AppHeaderTitle from "components/AppHeaderTitle";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";

const fetcher = (url: string, params: any) =>
  api
    .get(url, {
      params,
    })
    .then((res) => res.data);

interface Props {
  user: any;
}
const now = new Date();

function PerkList({ perks }: { perks: any[] }) {
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  return (
    <div ref={animationParent}>
      {perks.map((perk: any) => (
        <AppPerkCard key={perk.id} perk={perk} />
      ))}
    </div>
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
    user.business?.id && params
      ? [`/api/business/${user.business.id}/benefits`, params]
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
      <AppHeaderTitle title="Available Perks" />
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
        {!user.business?.id && (
          <Paper p="md" withBorder mb="md">
            <Text weight={500} mb="sm">
              No set business
            </Text>
            <Text size="sm" color="dimmed">
              You are not a part of a business yet, you can either
              <Link href="/business/join" passHref>
                <Anchor component="a"> join a business </Anchor>
              </Link>
              or
              <Link href="/business/create" passHref>
                <Anchor component="a"> create one</Anchor>
              </Link>
            </Text>
          </Paper>
        )}
        {!isLoading && Array.from(new Set(perks)).length == 0 && (
          <Paper p="md" mb="md" withBorder>
            <Text weight={500} mb="sm">
              No available results
            </Text>
            <Text size="sm" color="dimmed">
              When your business acquires perks that fit the criteria they will
              be displayed here
            </Text>
          </Paper>
        )}
        <PerkList perks={Array.from(new Set(perks))} />
        {isLoading && user.business?.id && (
          <Center>
            <Loader variant="bars" size="sm"></Loader>
          </Center>
        )}
        {!isLoading && user.business?.id && (
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
