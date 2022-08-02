import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  useMantineTheme,
  Image,
  Text,
  Paper,
  Tabs,
  SimpleGrid,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useWindowScroll } from "react-use";
import { AlertCircle } from "tabler-icons-react";
import { useRouter } from "next/router";
import axios from "axios";
import AppPerkCard from "components/AppPerkCard";

interface Props {
  user: any;
}

function CompanyLogo(props: any) {
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
        style={{ backgroundImage: `url(${props.logo})` }}
      ></div>
    </div>
  );
}

const Company: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();

  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    async function loadOffers() {
      setLoadingOffers(true);
      try {
        const { data } = await axios.get(
          `/api/company/${user.company.id}/offers`
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

  let tabPanelStyles: any = { minHeight: "50vh" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  if (!user.company) {
    return <div>You have to be a part of a company or create one</div>;
  }

  return (
    <div style={{ position: "relative", marginBottom: "49px" }}>
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
        <CompanyLogo
          logo={
            user.company.logo ||
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
          <Text mt="xs" size="xl" weight={500}>
            {user.company.name}
          </Text>
          <Paper radius="md" p="md">
            <SimpleGrid cols={3}>
              <div>
                <Text weight="bold" size="lg">
                  500
                </Text>
                <Text>Perks</Text>
              </div>
              <div>
                <Text weight="bold" size="lg">
                  {offers.length}
                </Text>
                <Text>Offers</Text>
              </div>
              <div>
                <Text weight="bold" size="lg">
                  1000
                </Text>
                <Text>Claims</Text>
              </div>
            </SimpleGrid>
          </Paper>
        </div>

        {user.adminOf && user.company?.paidMembership == false && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Subscription"
            color="yellow"
            radius="md"
            style={{ marginTop: theme.spacing.md, position: "initial" }}
            onClick={() => router.push("/subscription")}
          >
            You need to get a subscription to show offers and get perks, click
            here
          </Alert>
        )}
      </div>
      <Tabs variant="pills" color="primary" defaultValue="newest">
        <Tabs.List grow p="sm" sx={tabListStyles}>
          <Tabs.Tab value="newest">Newest</Tabs.Tab>
          <Tabs.Tab value="offers">Offers</Tabs.Tab>
          <Tabs.Tab value="about">About</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="newest" pt="md" sx={tabPanelStyles}>
          {/* TODO: show public and private just add a filter somewhere OR add the private instead of popular for mvp given that popular might be hard to calculate and make performant */}
          <Text align="center">Load benefits after aquiring them</Text>
        </Tabs.Panel>
        <Tabs.Panel value="offers" pt="md" sx={tabPanelStyles}>
          {!loadingOffers && offers.length === 0 && (
            <Text align="center">0 results found</Text>
          )}
          {loadingOffers ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            offers.map((offer: any) => (
              <AppPerkCard key={offer.id} perk={offer}></AppPerkCard>
            ))
          )}
        </Tabs.Panel>
        <Tabs.Panel value="about" p="md" sx={tabPanelStyles}>
          <Text>{user.company.about}</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Company;

export const getServerSideProps = withPageAuthRequired();
