import type { NextPage, GetServerSideProps } from "next";
import {
  useMantineTheme,
  Text,
  Box,
  Center,
  Loader,
  Paper,
  Button,
} from "@mantine/core";
import AppHeaderTitle from "components/AppHeaderTitle";
import { Category as CategoryType } from "@prisma/client";
import Category from "prisma/models/Category";
import api from "config/api";
import useSWR from "swr";
import AppWelcomeGuestModal from "components/AppWelcomeGuestModal";
import { useEffect, useMemo, useState } from "react";
import AppPerkCard from "components/AppPerkCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const fetcher = (url: string) => api.get(url);
const perkFetcher = (url: string, params: any) => {
  if (!url) return;
  return api.get(url, { params }).then((res) => res.data);
};

function useUser() {
  const { data: res, error } = useSWR("/api/me", fetcher);
  const userLoading = !res && !error;
  return {
    user: (res && res.data) || null,
    userLoadingError: error,
    userLoading,
  };
}

interface Props {
  category: CategoryType;
}

const CategoryView: NextPage<Props> = ({ category }) => {
  // UI stuff
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const listBackgroundColor = isDark
    ? theme.colors.dark[8]
    : theme.colors.gray[1];
  const categoryBg = isDark ? theme.colors.dark[7] : theme.white;
  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  // domain logic
  const { user, userLoading } = useUser();

  const [perks, setPerks] = useState<any[]>([]);
  const [cursor, setCursor] = useState<undefined | number>(undefined);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setPerks([]);
    setCursor(undefined);
    setSkip(0);
  }, []);

  const params = useMemo(() => {
    return {
      skip,
      cursor,
    };
  }, [skip, cursor]);

  const [endpoint, setEndpoint] = useState("");
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        setEndpoint(`/api/category/${category.id}/public-offers`);
      }
      if (user) {
        setEndpoint(`/api/category/${category.id}/perks`);
      }
    }
  }, [user, userLoading, category.id]);

  const { data: perksData, error: perksLoadingError } = useSWR(
    [endpoint, params],
    perkFetcher
  );
  const loadingPerks = !perksData && !perksLoadingError;
  const [theresMore, setTheresMore] = useState(true);

  useEffect(() => {
    if (perksData) {
      if (perksData.length == 0) {
        setTheresMore(false);
      } else {
        setTheresMore(true);
      }
      setPerks((perks) => [...perks, ...perksData]);
    }
  }, [perksData]);

  function loadMore() {
    setCursor(perks[perks.length - 1]?.id || undefined);
    setSkip(1);
  }

  return (
    <Box mb={49}>
      <AppHeaderTitle title="Category" />
      <Text
        size="sm"
        color="dimmed"
        align="center"
        px="md"
        pb="md"
        style={{
          position: "sticky",
          top: "49px",
          width: "100%",
          backgroundColor: categoryBg,
          zIndex: 11,
        }}
      >
        {userLoading
          ? category.name
          : user
          ? `Available perks with "${category.name}"`
          : `Public offers with ${category.name}`}
      </Text>
      <Box
        p="md"
        style={{
          backgroundColor: listBackgroundColor,
          minHeight: "calc(100vh - 137px)",
        }}
      >
        {userLoading && (
          <Center>
            <Loader size="sm" variant="bars" mt="sm"></Loader>
          </Center>
        )}
        {!userLoading && user && !user.businessId && (
          <Paper withBorder p="md" mb="md">
            <Text weight={500} mb="md">
              No business set
            </Text>
            <Text color="dimmed" size="sm">
              You need to join or create a business first
            </Text>
          </Paper>
        )}
        {!userLoading && (
          <>
            <div ref={animationParent}>
              {perks.map((offer: any) => (
                <div key={offer.id}>
                  <AppPerkCard perk={offer} />
                </div>
              ))}
            </div>
            {/* loader for initial offer load */}
            {loadingPerks && perks.length === 0 && (
              <Center>
                <Loader size="sm" variant="bars"></Loader>
              </Center>
            )}
            {!loadingPerks && perks.length === 0 && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} mb="sm">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  {user
                    ? `When your employer acquires perks on this category, they will be shown here`
                    : `There are no public offers on this category`}
                </Text>
              </Paper>
            )}
            {perks.length > 0 && (
              <Button
                mt="md"
                fullWidth
                loading={loadingPerks}
                disabled={!theresMore}
                onClick={loadMore}
              >
                {theresMore ? "Load more" : "Up to date"}
              </Button>
            )}
          </>
        )}
      </Box>
      {!userLoading && !user && <AppWelcomeGuestModal />}
    </Box>
  );
};

export default CategoryView;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const categoryId = Number(ctx.params!.categoryId);
  if (isNaN(categoryId)) {
    return { redirect: { destination: "/404", permanent: false } };
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    return { redirect: { destination: "/404", permanent: false } };
  }
  return {
    props: { category: JSON.parse(JSON.stringify(category)) },
  };
};
