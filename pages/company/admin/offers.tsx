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
} from "@mantine/core";
import AppPerkCard from "components/AppPerkCard";
import axios from "axios";
import Link from "next/link";

interface Props {
  user: any;
}

const CompanyOffers: NextPage<Props> = ({ user }) => {
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
          `/api/company/${user.company.id}/offers`,
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
  }, [setLoadingOffers, setOffers, user.company.id]);

  const [activeOffers, setActiveOffers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  useEffect(() => {
    setActiveOffers(offers.filter((offer: any) => offer.isActive === true));
    setDrafts(offers.filter((offer: any) => offer.isActive === false));
  }, [offers]);

  return (
    <Box mb={49}>
      <Box p="md">
        <Group align="center" position="apart" py="sm">
          <Text size="lg">
            Perks you are offering
          </Text>
          <Link href="/perk/create" passHref>
            <Button component="a" variant="filled">
              Create
            </Button>
          </Link>
        </Group>
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
      <Box p="md" sx={{ minHeight: "calc(100vh - 231px)", backgroundColor }}>
        {loadingOffers && (
          <Center>
            <Loader ml="md" size="sm" />
          </Center>
        )}
        {!loadingOffers && status === "active" && activeOffers.length === 0 && (
          <Text>No active perks found here</Text>
        )}
        {!loadingOffers && status === "draft" && drafts.length === 0 && (
          <Text>No drafts found here</Text>
        )}
        {status === "active" &&
          activeOffers.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer} />
          ))}
        {status === "draft" &&
          drafts.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer} />
          ))}
      </Box>
    </Box>
  );
};

export default CompanyOffers;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { redirect: { destination: "/401", permanent: false } };
    }
    return { props: {} };
  },
});
