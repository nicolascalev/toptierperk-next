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
  Paper,
} from "@mantine/core";
import api from "config/api";
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
  Package,
  Key,
} from "tabler-icons-react";
import { useEffect, useState } from "react";
import AppHeaderTitle from "components/AppHeaderTitle";
import AppFeedbackDrawer from "components/AppFeedbackDrawer";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

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
  const [openedFeedbackDrawer, setOpenedFeedbackDrawer] = useState(false);

  return (
    <Box p="md" mb={49}>
      <AppHeaderTitle title="Claim details" />
      <Box mb="xl">
        {claim && claim.approvedAt && (
          <Text
            size="sm"
            color={theme.colors.green[6]}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Verified
            <Checks size="1rem" style={{ marginLeft: 3 }} />
          </Text>
        )}
        {claim && !claim.approvedAt && (
          <Text
            align="center"
            size="sm"
            color={theme.colors.brand[6]}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Pending
            <Check size="1rem" style={{ marginLeft: 3 }} />
          </Text>
        )}
      </Box>
      {loadingClaim && (
        <Center>
          <Loader variant="bars" size="sm"></Loader>
        </Center>
      )}
      {claim && (
        <>
          {!claim.approvedAt &&
            claim.benefit!.useLimit &&
            claim.benefit!.useLimit <= claim.benefit!.claimAmount && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} color="red" size="sm">
                  Can not redeem
                </Text>
                <Text size="sm" color="dimmed">
                  This perk reached use limit amount before you redeemed it
                </Text>
              </Paper>
            )}
          {!claim.approvedAt && !claim.supplier.paidMembership && (
            <Paper withBorder p="md" mb="md">
              <Text weight={500} color="red" size="sm">
                Can not redeem
              </Text>
              <Text size="sm" color="dimmed">
                The supplier needs to renew their subscription
              </Text>
            </Paper>
          )}
          {claim.approvedAt && (
            <Box mb="md">
              <Text
                size="sm"
                color="dimmed"
                weight={500}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Checks size="1rem" style={{ marginRight: 3 }} />
                Verified At
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
            >
              <Key size="1rem" style={{ marginRight: 3 }} />
              Claim Id
            </Text>
            <Text>
              #{claim.id}, show it in case the supplier can not scan your code
            </Text>
          </Box>
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
              Claim before
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
            <Text
              size="sm"
              color="dimmed"
              weight={500}
              sx={{ display: "flex", alignItems: "center" }}
              mb={5}
            >
              <Package size="1rem" style={{ marginRight: 3 }} />
              Perk
            </Text>
            <AppPerkCard perk={claim.benefit} disableTopBar={true} />
          </Box>
          <Button
            mt={-theme.spacing.md}
            fullWidth
            leftIcon={<DotsVertical size={18} />}
            onClick={() => setOpenedOptionsDrawer(true)}
          >
            Options
          </Button>
          <Text mt="md" size="xs" color="dimmed" align="center">
            The QR is meant to be shown to the supplier of the perk only, if you
            try to scan it you will not be able to verify it
          </Text>
        </>
      )}
      <Drawer
        opened={openedOptionsDrawer}
        onClose={() => setOpenedOptionsDrawer(false)}
        position="bottom"
        title="Options"
        padding="md"
        size="sm"
      >
        <Stack spacing="xs">
          <Button
            variant="default"
            onClick={() => setOpenedFeedbackDrawer(true)}
          >
            Report issue
          </Button>
          <Button variant="filled" color="red">
            Delete claim
          </Button>
        </Stack>
      </Drawer>
      <AppFeedbackDrawer
        opened={openedFeedbackDrawer}
        onClose={() => setOpenedFeedbackDrawer(false)}
        onFeedbackCreate={() => setOpenedFeedbackDrawer(false)}
        size="full"
        position="right"
        issueTypes={[
          "The supplier can't confirm my order",
          "There should still be available offers",
          "The product is not what it said to be",
          "The supplier behaved inappropriately",
        ]}
        claimId={Number(router.query.claimId)}
      />
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
