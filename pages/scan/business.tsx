import type { NextPage } from "next";
import { User } from "@prisma/client";
import api from "config/api";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Loader,
  Center,
  Drawer,
  ScrollArea,
  Paper,
  Text,
  Button,
} from "@mantine/core";
import AppHeaderTitle from "components/AppHeaderTitle";
import AppCodeScanner from "components/AppCodeScanner";
import AppWelcomeGuestModal from "components/AppWelcomeGuestModal";
import { showNotification } from "@mantine/notifications";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import AppPerkCard from "components/AppPerkCard";
import AppSelectBusiness from "components/AppSelectBusiness";

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

const ScanBusinessView: NextPage = () => {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const [businessId, setBusinessId] = useState<number | null>(null);
  useEffect(() => {
    setBusinessId(Number(router.query.businessId));
  }, [router.query.businessId]);

  function onReadSuccess(result: string) {
    const queryString = result.split("?")[1];
    const urlParams = new URLSearchParams(queryString);
    const scanBusinessId: number | null = urlParams.get("businessId")
      ? Number(urlParams.get("businessId"))
      : null;
    if (!scanBusinessId) {
      return showNotification({
        title: "Error on scan",
        message: "This QR is not for a business from Toptierperk",
        color: "red",
        autoClose: 5000,
      });
    }
    setBusinessId(scanBusinessId);
  }

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
    if (user && businessId && user.businessId) {
      setEndpoint(`/api/business/${businessId}/beneficiary/${user.businessId}/perks`);
    }
    if (!user && businessId) {
      setEndpoint(`/api/business/${businessId}/public-offers`);
    }
    if (user && businessId && !user.businessId) {
      setEndpoint("");
    }
  }, [user, businessId]);

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

  return (
    <Box mb={49}>
      <AppHeaderTitle title="Scan business QR" />
      {userLoading && (
        <Center>
          <Loader size="sm" variant="bars" mt="md"></Loader>
        </Center>
      )}
      {!userLoading && (
        <>
          {user && !user.adminOfId && (
            <Paper withBorder p="md" m="md">
              <Text weight={500} mb="md">
                No business set
              </Text>
              <Text color="dimmed" size="sm">
                You need to join or create a business first
              </Text>
            </Paper>
          )}
          <Box p="md">
            <AppSelectBusiness onChange={val => setBusinessId(val)} />
          </Box>
          <Box style={{ width: "100%" }}>
            <AppCodeScanner onReadSuccess={onReadSuccess} />
          </Box>
          <Drawer
            opened={businessId && endpoint ? true : false}
            onClose={() => setBusinessId(null)}
            title={user ? "Perks available for you" : "Public business offers"}
            padding="md"
            size="full"
            position="bottom"
          >
            <ScrollArea style={{ height: "calc(100vh - 74px)" }}>
              <div ref={animationParent}>
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
              {!loadingOffers && offers.length === 0 && (
                <Paper withBorder p="md" mb="md">
                  <Text weight={500} mb="sm">
                    No results
                  </Text>
                  <Text color="dimmed" size="sm">
                    When there are offers available they will be shown here
                  </Text>
                </Paper>
              )}
              {offers.length > 0 && (
                <Button
                  mt="md"
                  fullWidth
                  loading={loadingOffers}
                  disabled={!theresMore}
                  onClick={loadMore}
                >
                  {theresMore ? "Load more" : "Up to date"}
                </Button>
              )}
            </ScrollArea>
          </Drawer>
          <AppWelcomeGuestModal />
        </>
      )}
    </Box>
  );
};

export default ScanBusinessView;
