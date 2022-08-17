import type { NextPage } from "next";
import type { User, Claim } from "@prisma/client";
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
import { useRouter } from "next/router";
import axios from "axios";
import useSWR from "swr";
import { showNotification } from "@mantine/notifications";
import { useState, useEffect } from "react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface UseFetchClaim {
  loadingClaim: boolean;
  claim: Claim | null;
}
function useFetchClaim(claimId?: Number): UseFetchClaim {
  // TODO: let user know if the claim was not found
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
          Scan Claim QR
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
        size="xl"
      > 
        <ScrollArea style={{ height: "440px" }} type="auto">
          {loadingClaim && (
            <Center mb="md">
              <Loader variant="bars" size="sm"></Loader>
            </Center>
          )}
          <Stack spacing="xs">
            <Button variant="default">Report issue</Button>
            <Button variant="filled" color="red">
              Delete claim
            </Button>
          </Stack>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export default ScanClaimView;

export const getServerSideProps = withPageAuthRequired();
