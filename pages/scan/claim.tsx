import type { NextPage } from "next";
import type { User, Claim, Benefit, Business } from "@prisma/client";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Box,
  Text,
  Group,
  Center,
  Loader,
  Button,
  Drawer,
  NumberInput,
  ScrollArea,
} from "@mantine/core";
import AppCodeScanner from "components/AppCodeScanner";
import AppPerkCard from "components/AppPerkCard";
import { useRouter } from "next/router";
import axios, { AxiosError } from "axios";
import useSWR from "swr";
import { showNotification } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { Calendar, Package, UserCircle, Search, Hash } from "tabler-icons-react";
import formatDate from "helpers/formatDate";

type ClaimWithRelations = Claim & {
  user: User;
  benefit: Benefit;
  supplier: Business;
};

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface UseFetchClaim {
  loadingClaim: boolean;
  claim: ClaimWithRelations | null;
  errorLoadingClaim: any;
}

function useFetchClaim(claimId?: Number): UseFetchClaim {
  // TODO: let user know if the claim was not found
  // TODO: notify user if they are forbidden from verifing a perk
  const { data, error } = useSWR(
    claimId ? `/api/claim/${claimId}` : null,
    fetcher,
    {
      // disable retry for some of these
      onErrorRetry: (error) => {
        // Never retry on 404.
        if (error.status === 404) return;
        // Never retry on 403.
        if (error.status === 403) return;
      },
    }
  );
  const loading = !data && !error && claimId ? true : false;
  return {
    loadingClaim: loading,
    claim: data,
    errorLoadingClaim: error,
  };
}

interface Props {
  user: User;
}

const ScanClaimView: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [claimId, setClaimId] = useState<undefined | number>(undefined);
  const [inputClaimId, setInputClaimId] = useState<undefined | number>(
    undefined
  );
  const { loadingClaim, claim, errorLoadingClaim } = useFetchClaim(claimId);
  // in case the user got here scaning from os camera, take the claimId from url
  useEffect(() => {
    if (router.query.claimId) {
      setClaimId(Number(router.query.claimId));
    }
  }, [router.query.claimId]);

  function getErrorMessage(axiosError: AxiosError) {
    if (axiosError.response?.status === 404) {
      return "The claim you tried to verify was not found, it was probably deleted";
    }
    if (axiosError.response?.status === 403) {
      return "You are not allowed to verify this claim, the perk that was attempted to be used was likely supplied by another business";
    }
  }

  function onReadSuccess(result: string) {
    const queryString = result.split("?")[1];
    const urlParams = new URLSearchParams(queryString);
    const claimId = urlParams.get("claimId")
      ? Number(urlParams.get("claimId"))
      : null;
    if (!claimId) {
      return showNotification({
        title: "Error on scan",
        message: "This QR is not for a claim from Toptierperk",
        color: "red",
        autoClose: 5000,
      });
    }
    setClaimId(claimId);
  }

  function onCloseDrawer() {
    setClaimId(undefined);
    setInputClaimId(undefined);
  }

  return (
    <Box mb={49}>
      <Group p="md" position="apart" align="center">
        <Text size="xl" weight={500}>
          Scan costumer claim QR
        </Text>
      </Group>
      {!loadingClaim && (
        <>
          <Box style={{ width: "100%" }}>
            <AppCodeScanner onReadSuccess={onReadSuccess} />
          </Box>
          <Box p="md">
            <NumberInput
              defaultValue={undefined}
              placeholder="Claim id"
              label="Claim Id"
              description="If the scanner is not available, you can put the claim id here"
              hideControls
              min={1}
              icon={<Hash size={16} />}
              value={inputClaimId}
              onChange={(val) => setInputClaimId(val)}
            />
            <Group position="right" mt="md">
              <Button
                rightIcon={<Search size={16} />}
                disabled={inputClaimId === undefined || inputClaimId <= 0}
                onClick={() => setClaimId(inputClaimId)}
              >
                Search
              </Button>
            </Group>
          </Box>
        </>
      )}

      <Drawer
        opened={claimId !== undefined}
        onClose={onCloseDrawer}
        position="bottom"
        title="Claim details"
        padding="md"
        size={!loadingClaim && errorLoadingClaim ? "sm" : "full"}
      >
        <ScrollArea style={{ height: "100%" }} type="never">
          {loadingClaim && (
            <Center mb="md">
              <Loader variant="bars" size="sm"></Loader>
            </Center>
          )}
          {!loadingClaim && !claim && errorLoadingClaim && (
            <>
              <Text>{getErrorMessage(errorLoadingClaim)}</Text>
              <Button
                fullWidth
                mt="md"
                variant="default"
                onClick={onCloseDrawer}
              >
                Close
              </Button>
            </>
          )}
          {!loadingClaim && claim && (
            <Box pb="md">
              <Box mb="md">
                <Text
                  size="sm"
                  color="dimmed"
                  weight={500}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Calendar size="1rem" style={{ marginRight: 3 }} />
                  Created At
                </Text>
                <Text>{formatDate(claim.createdAt, "DETAILED_READABLE")}</Text>
              </Box>
              <Box mb="md">
                <Text
                  size="sm"
                  color="dimmed"
                  weight={500}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Calendar size="1rem" style={{ marginRight: 3 }} />
                  Finishes At
                </Text>
                <Text>
                  {claim.benefit.finishesAt
                    ? formatDate(claim.benefit.finishesAt, "SHORT_TEXT")
                    : "This perk has no expiration date"}
                </Text>
              </Box>
              <Box mb="md">
                <Text
                  size="sm"
                  color="dimmed"
                  weight={500}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <UserCircle size="1rem" style={{ marginRight: 3 }} />
                  User
                </Text>
                <Text>{claim.user.name}</Text>
                <Text size="xs" color="dimmed">
                  {claim.user.email}
                </Text>
              </Box>
              <Box mb="md">
                <Text
                  size="sm"
                  color="dimmed"
                  weight={500}
                  mb="xs"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Package size="1rem" style={{ marginRight: 3 }} />
                  Perk
                </Text>
                <AppPerkCard perk={claim.benefit} disableTopBar={true} />
              </Box>
              <Button fullWidth>Confirm</Button>
            </Box>
          )}
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default ScanClaimView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx: any) {
    const session = getSession(ctx.req, ctx.res);
    if (!session!.user.adminOfId && !session!.user.canVerify) {
      return { redirect: { destination: "/401", permanent: false } };
    }
    return { props: {} };
  },
});
