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
} from "@mantine/core";
import { Filter } from "tabler-icons-react";
import AppPerkCard from "components/AppPerkCard";
import AppCategorySelect from "components/AppCategorySelect";
import { useState, useEffect } from "react";
import { DatePicker } from "@mantine/dates";
import axios from "axios";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useCallback } from "react";
import { uniqBy, debounce } from "lodash";

type PrivacyType = "all" | "private" | "public";
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
}, 500)

const AvailablePerksView: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";

  const filterBackground = isDark ? theme.colors.dark[7] : theme.white;
  const feedBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];
  const borderBottom = "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da");

  const [openedFilters, setOpenedFilters] = useState(false);
  const [perks, setPerks] = useState<any[]>([]);

  const [searchString, setSearchString] = useState('')

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
  const isPrivate: boolean | undefined = getIsPrivate(selectedPrivacy);

  const acquiredOptions = [
    { label: "All", value: "all" },
    { label: "Acquired", value: "acquired" },
    { label: "Not acquired", value: "notacquired" },
  ];
  const [selectedAcquired, setSelectedAcquired] = useState<AquiredType>("all");
  function getIsAquired(value: AquiredType) {
    if (value == "acquired") {
      return true;
    }
    if (value == "notacquired") {
      return false;
    }
    return undefined;
  }
  const acquired: boolean | undefined = getIsAquired(selectedAcquired);

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
    debSetFilter(resetSearch, setFilters, searchString)
  }, [searchString])

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
        `/api/company/${user.company.id}/benefits`,
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
    user.company.id,
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

  return (
    <Box sx={{ marginBottom: "49px" }}>
      <Group
        p="md"
        sx={{
          position: "sticky",
          top: "48px",
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
        <ActionIcon title="Open filters" onClick={() => setOpenedFilters(true)}>
          <Filter></Filter>
        </ActionIcon>
      </Group>
      <Box p="md" sx={{ backgroundColor: feedBackground, minHeight: "calc(100vh - 168px)" }}>
        {perks.length == 0 && !loadingPerks && (
          <Text>No results at the moment</Text>
        )}
        {perks.length > 0 &&
          uniqBy(perks, "id").map((perk: any) => (
            <AppPerkCard key={perk.id} perk={perk} />
          ))}
        {loadingPerks && (
          <Center>
            <Loader size="sm" />
          </Center>
        )}
        {theresMore && !loadingPerks && (
          <Button fullWidth onClick={loadPerks}>
            Load more
          </Button>
        )}
        {perks.length !== 0 && !theresMore && !loadingPerks && (
          <Text align="center">Up to date</Text>
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
          <Box sx={{ width: "100%" }}>
            <Text weight={500} size="sm" mb={1}>
              Acquired
            </Text>
            <SegmentedControl
              sx={{ width: "100%" }}
              value={selectedAcquired}
              onChange={(val: AquiredType) => setSelectedAcquired(val)}
              data={acquiredOptions}
            />
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
      return { redirect: { destination: '/401', permanent: false } };
    }
    return { props: {} };
  },
});
