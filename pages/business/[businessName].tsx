import type { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Business from "prisma/models/Business";
import {
  useMantineTheme,
  Drawer,
  Text,
  Paper,
  Tabs,
  SimpleGrid,
  Center,
  Box,
  Anchor,
  Button,
  ActionIcon,
  Loader,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useWindowScroll } from "react-use";
import { Qrcode } from "tabler-icons-react";
import { useRouter } from "next/router";
import AppPerkCard from "components/AppPerkCard";
import Link from "next/link";
import AppHeaderTitle from "components/AppHeaderTitle";
// @ts-ignore
import NumericLabel from "react-pretty-numbers";
import AppCodeBox from "components/AppCodeBox";
import api from "config/api";
import useSWR from "swr";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const fetcher = (url: string) => api.get(url);
const perkFetcher = (url: string, params: any) => {
  if (!url) return;
  return api.get(url, { params }).then((res) => res.data);
};

function useFetchOffers(user: any, userLoading: boolean, businessId: number) {
  const [offers, setOffers] = useState<any[]>([]);
  const [cursor, setCursor] = useState<undefined | number>(undefined);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setOffers([]);
    setCursor(undefined);
    setSkip(0);
  }, []);

  useEffect(() => {
    setOffers([]);
    setCursor(undefined);
    setSkip(0);
  }, [businessId]);

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
        setEndpoint(`/api/business/${businessId}/public-offers`);
      }
      if (user && user.businessId) {
        setEndpoint(
          `/api/business/${businessId}/beneficiary/${user.businessId}/available-offers`
        );
      }
    }
  }, [user, userLoading, businessId]);

  const { data: offersData, error: offersLoadingError } = useSWR(
    [endpoint, params],
    perkFetcher
  );
  const loadingOffers = !offersData && !offersLoadingError;
  const [theresMore, setTheresMore] = useState(true);

  useEffect(() => {
    if (offersData) {
      if (offersData.length == 0) {
        setTheresMore(false);
      } else {
        setTheresMore(true);
      }
      setOffers((offers) => [...offers, ...offersData]);
    }
  }, [offersData]);

  function loadMore() {
    setCursor(offers[offers.length - 1]?.id || undefined);
    setSkip(1);
  }

  return {
    offers,
    loadingOffers,
    theresMoreOffers: theresMore,
    loadMoreOffers: loadMore,
  };
}

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
  business: any;
}

function BusinessLogo(props: any) {
  const { y } = useWindowScroll();
  const [logoSize, setLogoSize] = useState(64);
  useEffect(() => {
    if (y < 300) {
      setLogoSize(64 - y);
    }
  }, [y]);

  return (
    <div
      className="logo__container"
      style={{ width: logoSize, height: logoSize }}
    >
      <div
        className="logo"
        style={{ backgroundImage: `url('${props.logo}')` }}
      ></div>
    </div>
  );
}

const SingleBusinessView: NextPage<Props> = ({ business }) => {
  const { user, userLoading } = useUser();
  const theme = useMantineTheme();
  const router = useRouter();

  const isDark = theme.colorScheme === "dark";

  const logoContainerBg =
    theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white;

  const tabListStyles: any = {
    position: "sticky",
    top: "102px",
    zIndex: 10,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    borderBottom: "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da"),
  };

  let tabPanelStyles: any = { minHeight: "calc(100vh - 305px)" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  const [animationParentOffers] = useAutoAnimate<HTMLDivElement>();
  const [animationParentPerks] = useAutoAnimate<HTMLDivElement>();

  function offersTitle() {
    if (user && user.businessId) {
      return "Available offers for " + user.business.name;
    }
    if (user && !user.businessId) {
      return "Join business";
    }
    return "Public offers";
  }
  const [showBusinessQr, setShowBusinessQr] = useState(false);

  // domain
  const { offers, loadingOffers, theresMoreOffers, loadMoreOffers } =
    useFetchOffers(user, userLoading, business.id);
  const [perks, setPerks] = useState<any[]>([]);

  return (
    <div style={{ marginBottom: "49px" }}>
      <AppHeaderTitle title={business.name} />
      <Head>
        <title>Toptierperk - {business.name}</title>
      </Head>
      <ActionIcon
        component="a"
        color="dark"
        size="md"
        title="Business QR"
        onClick={() => setShowBusinessQr(true)}
        style={{
          position: "fixed",
          right: "10px",
          top: "10px",
          zIndex: 101,
        }}
      >
        <Qrcode />
      </ActionIcon>
      <Center
        p="xs"
        sx={{
          height: "64px",
          position: "sticky",
          top: "49px",
          zIndex: 11,
          backgroundColor: logoContainerBg,
        }}
      >
        <BusinessLogo
          logo={
            business.logo?.url ||
            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          }
        />
      </Center>
      <div
        style={{
          paddingRight: theme.spacing.md,
          paddingLeft: theme.spacing.md,
          paddingTop: 0,
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <Paper radius="md" p="md">
            <SimpleGrid cols={3}>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business._count.benefitsFrom}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Perks
                </Text>
              </div>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business._count.benefits}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Offers
                </Text>
              </div>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business.claimAmount}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Claims
                </Text>
              </div>
            </SimpleGrid>
          </Paper>
        </div>
      </div>
      <Tabs variant="pills" color="primary" defaultValue="offers">
        <Tabs.List grow p="sm" sx={tabListStyles}>
          <Tabs.Tab value="offers">Offers</Tabs.Tab>
          <Tabs.Tab value="perks">Perks</Tabs.Tab>
          <Tabs.Tab value="about">About</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="offers" pt="md" sx={tabPanelStyles}>
          {userLoading && (
            <Center>
              <Loader size="sm" variant="bars"></Loader>
            </Center>
          )}
          {!userLoading && (
            <>
              <Text color="dimmed" px="md" size="sm">
                {offersTitle()}
              </Text>
              <Box px="md" pb="md">
                <div ref={animationParentOffers}>
                  {offers.map((offer: any) => (
                    <div key={offer.id}>
                      <AppPerkCard perk={offer} />
                    </div>
                  ))}
                </div>
                {/* loader for initial offer load */}
                {loadingOffers && offers.length === 0 && (
                  <Center>
                    <Loader size="sm" variant="bars"></Loader>
                  </Center>
                )}
                {!loadingOffers &&
                  offers.length === 0 &&
                  user &&
                  user.businessId && (
                    <Paper withBorder p="md" mb="md">
                      <Text weight={500} mb="sm">
                        No results
                      </Text>
                      <Text color="dimmed" size="sm">
                        When there are offers available they will be shown here
                      </Text>
                    </Paper>
                  )}
                {!loadingOffers &&
                  offers.length === 0 &&
                  user &&
                  !user.businessId && (
                    <Paper withBorder p="md" mb="md">
                      <Text weight={500} mb="sm">
                        You need to belong to a business
                      </Text>
                      <Text color="dimmed" size="sm">
                        When you belong to a business you will see custom offers
                        from this supplier here
                      </Text>
                    </Paper>
                  )}
                {offers.length > 0 && (
                  <Button
                    mt="md"
                    fullWidth
                    loading={loadingOffers}
                    disabled={!theresMoreOffers}
                    onClick={loadMoreOffers}
                  >
                    {theresMoreOffers ? "Load more" : "Up to date"}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="perks" pt="md" sx={tabPanelStyles}>
          {userLoading && (
            <Center>
              <Loader size="sm" variant="bars"></Loader>
            </Center>
          )}
          {!userLoading && (
            <>
              <Text color="dimmed" px="md" size="sm">
                {user ? "Perks in common and public" : "Public perks"}
              </Text>
            </>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="about" p="md" sx={tabPanelStyles}>
          <Text style={{ whiteSpace: "pre-wrap" }}>{business.about}</Text>
        </Tabs.Panel>
      </Tabs>
      <Drawer
        opened={showBusinessQr}
        onClose={() => setShowBusinessQr(false)}
        title="Business QR code"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Box pt="xl">
          <AppCodeBox
            imageUrl={
              business.logo?.url ||
              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            }
            title={business.name}
            description={`Show this qr to costumers to find ${business.name} perk offers`}
            qrValue={`${process.env.NEXT_PUBLIC_BASE_URL}/scan/business?businessId=${business.id}`}
          />
        </Box>
      </Drawer>
    </div>
  );
};

export default SingleBusinessView;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const businessName = ctx.params!.businessName as string;
  const business: any = await Business.getPublicProfile(businessName);

  return { props: { business: JSON.parse(JSON.stringify(business)) } };
};
