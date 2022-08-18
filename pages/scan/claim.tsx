import type { NextPage } from "next";
import type { User, Claim, Benefit, Business } from "@prisma/client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Box,
  Text,
  Group,
  Center,
  Loader,
  Button,
  Drawer,
  Stack,
  ScrollArea,
} from "@mantine/core";
import AppCodeScanner from "components/AppCodeScanner";
import AppPerkCard from "components/AppPerkCard";
import { useRouter } from "next/router";
import axios from "axios";
import useSWR from "swr";
import { showNotification } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { Calendar, Package, UserCircle } from "tabler-icons-react";
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
}
function useFetchClaim(claimId?: Number): UseFetchClaim {
  // TODO: let user know if the claim was not found
  // TODO: notify user if they are forbidden from verifing a perk
  const { data, error } = useSWR(
    claimId ? `/api/claim/${claimId}` : null,
    fetcher
  );
  const loading = !data && !error && claimId ? true : false;
  return {
    loadingClaim: loading,
    claim: data,
  };
}

interface Props {
  user: User;
}

const ScanClaimView: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [claimId, setClaimId] = useState<undefined | number>(undefined);
  const { loadingClaim, claim } = useFetchClaim(claimId);
  // in case the user got here scaning from os camera, take the claimId from url
  useEffect(() => {
    if (router.query.claimId) {
      setClaimId(Number(router.query.claimId));
    }
  }, [router.query.claimId]);

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

  return (
    <Box mb={49}>
      <Group p="md" position="apart" align="center">
        <Text size="xl" weight={500}>
          Scan Costumer Claim QR
        </Text>
      </Group>
      {!loadingClaim && (
        <Box style={{ width: "100%" }}>
          <AppCodeScanner onReadSuccess={onReadSuccess} />
        </Box>
      )}

      <Drawer
        opened={claimId !== undefined}
        onClose={() => setClaimId(undefined)}
        position="bottom"
        title="Claim details"
        padding="md"
        size="full"
      >
        <ScrollArea style={{ height: "100%" }} type="never">
          {loadingClaim && (
            <Center mb="md">
              <Loader variant="bars" size="sm"></Loader>
            </Center>
          )}
          {!loadingClaim && !claim && (
            // i can put the result here if its 404 or 403
            <Text>
              There was not a perk found reason being PUT ERROR FROM API HERE
            </Text>
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
                <Text>
                  {claim.user.name}
                </Text>
                <Text size="xs" color="dimmed">{claim.user.email}</Text>
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

export const getServerSideProps = withPageAuthRequired();
