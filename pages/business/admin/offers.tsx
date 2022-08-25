import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import {
  useMantineTheme,
  Text,
  Box,
  SegmentedControl,
  Loader,
  Group,
  Button,
  Center,
  Paper,
  ActionIcon,
} from "@mantine/core";
import AppPerkCard from "components/AppPerkCard";
import axios from "axios";
import Link from "next/link";
import AppHeaderTitle from "components/AppHeaderTitle";
import { SquarePlus } from "tabler-icons-react";

interface Props {
  user: any;
}

const BusinessOffers: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const [status, setStatus] = useState("active");
  const isDark = theme.colorScheme === "dark" ? true : false;
  const backgroundColor = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    async function loadOffers() {
      setLoadingOffers(true);
      try {
        const { data } = await axios.get(
          `/api/business/${user.business.id}/offers`,
          { params: { status: "ALL" } }
        );
        setOffers(data);
      } catch (err) {
        // TODO: do something with the error
        console.log(err);
      } finally {
        setLoadingOffers(false);
      }
    }
    loadOffers();
  }, [setLoadingOffers, setOffers, user.business.id]);

  const [activeOffers, setActiveOffers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  useEffect(() => {
    setActiveOffers(offers.filter((offer: any) => offer.isActive === true));
    setDrafts(offers.filter((offer: any) => offer.isActive === false));
  }, [offers]);

  return (
    <Box mb={49}>
      <AppHeaderTitle title="Your business offers" />
      <Box p="md">
        <Link href="/perk/create" passHref>
          <ActionIcon
            component="a"
            size="md"
            title="Create perk"
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              zIndex: 101,
            }}
          >
            <SquarePlus />
          </ActionIcon>
        </Link>
        <SegmentedControl
          fullWidth
          value={status}
          onChange={setStatus}
          data={[
            {
              label: "Active " + (!loadingOffers ? activeOffers.length : ""),
              value: "active",
            },
            {
              label: "Draft " + (!loadingOffers ? drafts.length : ""),
              value: "draft",
            },
          ]}
        />
      </Box>
      <Box p="md" sx={{ minHeight: "calc(100vh - 173px)", backgroundColor }}>
        {loadingOffers && (
          <Center>
            <Loader ml="md" size="sm" variant="bars" />
          </Center>
        )}
        {!loadingOffers && status === "active" && activeOffers.length === 0 && (
          <Paper p="md" withBorder>
            <Text weight={500} mb="md">
              No perks to show
            </Text>
            <Text color="dimmed">
              When you create active perks, they will be shown here
            </Text>
          </Paper>
        )}
        {!loadingOffers && status === "draft" && drafts.length === 0 && (
          <Paper p="md" withBorder>
            <Text weight={500} mb="md">
              No drafts to show
            </Text>
            <Text color="dimmed">
              When you manually disable a perk, it will be shown here. Also if
              you save it to publish later
            </Text>
          </Paper>
        )}
        {status === "active" &&
          activeOffers.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer} disableTopBar={true} />
          ))}
        {status === "draft" &&
          drafts.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer} disableTopBar={true} />
          ))}
      </Box>
    </Box>
  );
};

export default BusinessOffers;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { redirect: { destination: "/401", permanent: false } };
    }
    return { props: {} };
  },
});
