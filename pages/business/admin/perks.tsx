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
  Button,
  Indicator,
  Paper,
} from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "components/AppPerkCard";
import AppCategorySelect from "components/AppCategorySelect";
import AppPrivacySelect from "components/AppPrivacySelect";
import AppAquiredSelect from "components/AppAquiredSelect";
import { useState, useEffect } from "react";
import { DatePicker } from "@mantine/dates";
import axios from "axios";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useCallback } from "react";
import { uniqBy, debounce } from "lodash";
import AppHeaderTitle from "components/AppHeaderTitle";

type AquiredType = "all" | "acquired" | "notacquired";

type Filters = {
  searchString: string;
  category?: string;
  startsAt?: Date;
  isPrivate: undefined | boolean;
  acquired: undefined | boolean;
};

interface Props {
  user: any;
}

const debSetFilter = debounce((resetSearch, setFilters, searchString) => {
  resetSearch();
  setFilters((fil: any) => ({
    ...fil,
    ...{ searchString },
  }));
}, 500);

const AvailablePerksView: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const filterBackground = isDark ? theme.colors.dark[7] : theme.white;
  const feedBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];
  const borderBottom =
    "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da");

  const [openedFilters, setOpenedFilters] = useState(false);
  const [perks, setPerks] = useState<any[]>([]);

  const [searchString, setSearchString] = useState("");

  const [isPrivate, setIsPrivate] = useState<undefined | boolean>(undefined);
  const [acquired, setAcquired] = useState<undefined | boolean>(undefined);

  const [category, setCategory] = useState<any>(undefined);
  const [startsAt, setStartsAt] = useState<Date | null>(null);

  const [filters, setFilters] = useState<Filters>({
    searchString: "",
    isPrivate: undefined,
    acquired: undefined,
    category: undefined,
    startsAt: undefined,
  });

  // on search string change
  useEffect(() => {
    debSetFilter(resetSearch, setFilters, searchString);
  }, [searchString]);

  function onCloseDrawer() {
    setOpenedFilters(false);

    if (
      filters.isPrivate == isPrivate &&
      filters.category == (category?.value || undefined) &&
      filters.startsAt == (startsAt || undefined) &&
      filters.acquired == acquired
    ) {
      return;
    }

    resetSearch();
    setFilters({
      ...filters,
      ...{
        isPrivate: isPrivate,
        category: category?.value || undefined,
        startsAt: startsAt || undefined,
        acquired: acquired,
      },
    });
  }

  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [skip, setSkip] = useState<1 | 0>(0);
  const [theresMore, setTheresMore] = useState(true);
  const [loadingPerks, setLoadingPerks] = useState(false);
  const loadPerks = useCallback(async () => {
    try {
      setLoadingPerks(true);
      const { data } = await axios.get(
        `/api/business/${user.business.id}/benefits`,
        {
          params: {
            searchString: filters.searchString,
            skip: skip,
            take: 10,
            cursor: cursor,
            category: filters.category,
            privacy: filters.isPrivate,
            acquired: filters.acquired,
            startsAt: filters.startsAt,
          },
        }
      );
      if (data.length < 10) {
        setTheresMore(false);
      }
      if (data.length > 0) {
        setCursor(data[data.length - 1].id);
        setSkip(1);
      }
      if (data.length == 0) {
        setPerks([]);
      }
      setPerks((perks) => [...perks, ...data]);
    } catch (err) {
      console.log(err, "loading perks");
    } finally {
      setLoadingPerks(false);
    }
  }, [
    cursor,
    filters.acquired,
    filters.category,
    filters.isPrivate,
    filters.searchString,
    filters.startsAt,
    skip,
    user.business.id,
  ]);

  useEffect(() => {
    loadPerks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function resetSearch() {
    setPerks([]);
    setCursor(undefined);
    setSkip(0);
    setTheresMore(true);
  }

  function clearFilters() {
    setIsPrivate(undefined);
    setCategory(undefined);
    setStartsAt(null);
    setAcquired(undefined);
  }

  const hasActiveFilters = () => {
    if (
      Object.values(filters)
        .map((val: any) => val !== "" && val !== undefined)
        .includes(true)
    ) {
      return true;
    }
    return false;
  };

  return (
    <Box sx={{ marginBottom: "49px" }}>
      <AppHeaderTitle title="Acquire perks" />
      <Group
        p="md"
        sx={{
          position: "sticky",
          top: "47px",
          backgroundColor: filterBackground,
          zIndex: 10,
          borderBottom,
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
          minHeight: "calc(100vh - 168px)",
        }}
      >
        {perks.length == 0 && !loadingPerks && (
          <Paper p="md" withBorder mb="md">
            <Text weight={500} mb="sm">
              No results
            </Text>
            <Text color="dimmed" size="sm">
              When there are perks available to your business that fit the
              search criteria, they will be displayed here
            </Text>
          </Paper>
        )}
        {perks.length > 0 &&
          uniqBy(perks, "id").map((perk: any) => (
            <AppPerkCard key={perk.id} perk={perk} />
          ))}
        {loadingPerks && (
          <Center>
            <Loader variant="bars" size="sm" />
          </Center>
        )}
        {theresMore && !loadingPerks && (
          <Button fullWidth onClick={loadPerks}>
            Load more
          </Button>
        )}
        {perks.length !== 0 && !theresMore && !loadingPerks && (
          <Button fullWidth disabled>
            Up to date
          </Button>
        )}
      </Box>

      <Drawer
        opened={openedFilters}
        onClose={onCloseDrawer}
        title="Filters"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Stack spacing="sm">
          <Box sx={{ width: "100%" }}>
            <AppPrivacySelect value={isPrivate} onChange={setIsPrivate} />
          </Box>
          <Box sx={{ width: "100%" }}>
            <AppAquiredSelect value={acquired} onChange={setAcquired} />
          </Box>
          <AppCategorySelect onChange={setCategory} value={category} />
          <DatePicker
            placeholder="Pick date"
            label="Available on"
            description="Find perks that will be available on a certain day"
            minDate={new Date()}
            value={startsAt}
            onChange={setStartsAt}
          />
          {hasActiveFilters() && (
            <Button onClick={clearFilters}>Clear filters</Button>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
};

export default AvailablePerksView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { redirect: { destination: "/401", permanent: false } };
    }
    return { props: {} };
  },
});
