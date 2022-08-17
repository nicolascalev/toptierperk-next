import Claim from "prisma/models/Claim";
import type { NextPage } from "next";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import {
  useMantineTheme,
  Box,
  Center,
  Loader,
  Text,
  Drawer,
  Group,
  Button,
  Stack,
} from "@mantine/core";
import axios from "axios";
import useSWR from "swr";
import formatDate from "helpers/formatDate";
import AppPerkCard from "components/AppPerkCard";
import AppCodeBox from "components/AppCodeBox";
import {
  Calendar,
  BuildingSkyscraper,
  Qrcode,
  Checks,
  Check,
  DotsVertical,
} from "tabler-icons-react";
import { useEffect, useState } from "react";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface Props {
  user: any;
}

const ClaimView: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { data: claim, error } = useSWR(
    "/api/claim/" + router.query.claimId,
    fetcher
  );
  const loadingClaim = !claim && !error;

  const [verifyUrl, setVerifyUrl] = useState("");
  useEffect(() => {
    if (claim) {
      setVerifyUrl(`${window.location.origin}/scan/claim?claimId=${claim.id}`);
    }
  }, [claim]);

  const [openedOptionsDrawer, setOpenedOptionsDrawer] = useState(false);

  return (
    <Box p="md" mb={49}>
      <Group position="apart" align="center" mb="xl">
        <Text size="xl" weight={500}>
          Claim details
        </Text>
        {claim && claim.approvedAt && (
          <Text
            size="sm"
            color={theme.colors.green[6]}
            style={{ display: "flex", alignItems: "center" }}
          >
            Verified
            <Checks size="1rem" style={{ marginLeft: 3 }} />
          </Text>
        )}
        {claim && !claim.approvedAt && (
          <Text
            size="sm"
            color={theme.colors.brand[6]}
            style={{ display: "flex", alignItems: "center" }}
          >
            Pending
            <Check size="1rem" style={{ marginLeft: 3 }} />
          </Text>
        )}
      </Group>
      {loadingClaim && (
        <Center>
          <Loader variant="bars" size="sm"></Loader>
        </Center>
      )}
      {claim && (
        <>
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
          {claim.approvedAt && (
            <Box mb="md">
              <Text
                size="sm"
                color="dimmed"
                weight={500}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Checks size="1rem" style={{ marginRight: 3 }} />
                Approved At
              </Text>
              <Text>{formatDate(claim.approvedAt, "DETAILED_READABLE")}</Text>
            </Box>
          )}
          <Box mb="md">
            <Text
              size="sm"
              color="dimmed"
              weight={500}
              sx={{ display: "flex", alignItems: "center" }}
              mb="xs"
            >
              <Qrcode size="1rem" style={{ marginRight: 3 }} />
              QR code
            </Text>
            <AppCodeBox
              imageUrl={
                user.picture?.url ||
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              }
              title="Show this QR"
              description="Don't share it, this QR will only work for you"
              qrValue={verifyUrl}
            />
          </Box>
          <Box mb="md">
            <Text
              size="sm"
              color="dimmed"
              weight={500}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <BuildingSkyscraper size="1rem" style={{ marginRight: 3 }} />
              Supplier
            </Text>
            <Text>{claim.supplier.name}</Text>
          </Box>
          <Box mb="md">
            <Text size="sm" weight={500} mb="xs">
              Perk
            </Text>
            <AppPerkCard perk={claim.benefit} />
          </Box>
          <Box mb="md">
            <Text
              size="sm"
              color="dimmed"
              weight={500}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Calendar size="1rem" style={{ marginRight: 3 }} />
              Claim before
            </Text>
            <Text>
              {claim.benefit.finishesAt
                ? formatDate(claim.benefit.finishesAt, "SHORT_TEXT")
                : "This perk has no expiration date"}
            </Text>
          </Box>
          <Button
            fullWidth
            leftIcon={<DotsVertical size={18} />}
            onClick={() => setOpenedOptionsDrawer(true)}
          >
            Options
          </Button>

          <Drawer
            opened={openedOptionsDrawer}
            onClose={() => setOpenedOptionsDrawer(false)}
            position="bottom"
            title="Options"
            padding="md"
            size="sm"
          >
            <Stack spacing="xs">
              <Button variant="default">Report issue</Button>
              <Button variant="filled" color="red">Delete claim</Button>
            </Stack>
          </Drawer>
        </>
      )}
    </Box>
  );
};

export default ClaimView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx: any) {
    const session = getSession(ctx.req, ctx.res);
    const claimId = Number(ctx.params.claimId);
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return { redirect: { destination: "/404", permanent: false } };
    }
    if (session!.user.id !== claim!.userId) {
      return { redirect: { destination: "/403", permanent: false } };
    }
    return { props: {} };
  },
});
