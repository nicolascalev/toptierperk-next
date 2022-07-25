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
import { debounce } from "lodash";
import { AlertCircle } from "tabler-icons-react";
import { useRouter } from "next/router";
import axios from "axios";
import AppPerkCard from "components/AppPerkCard";

const debounceScrollHandle = debounce((y, setShowCompanyInfo) => {
  if (y <= 50) {
    setShowCompanyInfo(true);
  } else {
    setShowCompanyInfo(false);
  }
}, 200);

const useDisplayProfile = () => {
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  const { y } = useWindowScroll();
  debounceScrollHandle(y, setShowCompanyInfo);
  const detailsOpacity = showCompanyInfo ? 1 : 0;

  const logoClass = showCompanyInfo ? "logo" : "logo logo__shrink";
  return { showCompanyInfo, detailsOpacity, logoClass };
};

interface Props {
  user: any;
}

const Company: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { logoClass, showCompanyInfo } = useDisplayProfile();

  const [loadingOffers, setLoadingOffers] = useState(false);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    async function loadOffers() {
      setLoadingOffers(true);
      try {
        const { data } = await axios.get(
          `/api/company/${user.company.id}/offers`
        );
        console.log(data);
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

  const isDark = theme.colorScheme === "dark"
  const logoContainerStyles: any = {
    position: "sticky",
    top: "50px",
    display: "flex",
    justifyContent: "center",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    zIndex: 10,
    padding: theme.spacing.xs,
  }
  if (!showCompanyInfo) {
    logoContainerStyles.borderBottom = "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da");
  } 

  if (!user.company) {
    return <div>You have to be a part of a company or create one</div>;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", marginBottom: "49px" }}>
      {user.company.logo && (
        <div
          style={logoContainerStyles}
        >
          {/* this div reduces impact of stats on scroll for now */}
          <div
            style={{
              width: "100%",
              height: "34px",
              position: "absolute",
              top: "-1px",
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.white,
            }}
          ></div>
          <Image
            src={user.company.logo?.url}
            alt={user.company.name + " Toptierperk"}
            imageProps={{ className: logoClass, style: undefined }}
          ></Image>
        </div>
      )}
      <div
        style={{
          padding: theme.spacing.md,
          display: "flex",
          flexWrap: "wrap",
        }}
        className={
          showCompanyInfo
            ? "company__info"
            : "company__info company__info_hidden"
        }
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <Text size="xl" weight={500}>
            {user.company.name}
          </Text>
          <Paper
            radius="md"
            p="md"
            style={{
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
              marginTop: theme.spacing.md,
            }}
          >
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
      <div>
        <Tabs grow variant="pills" position="apart" color="primary">
          {/* TODO: show public and private just add a filter somewhere OR add the private instead of popular for mvp given that popular might be hard to calculate and make performant */}
          {/* TODO: upgrade to mantine v5 and change bg color on tab content for light theme */}
          <Tabs.Tab label="Newest">
            <div>First tab content</div>
          </Tabs.Tab>
          <Tabs.Tab label="Offers">
            {loadingOffers ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              offers.map((offer: any) => (
                <AppPerkCard key={offer.id} perk={offer}></AppPerkCard>
              ))
            )}
          </Tabs.Tab>
          <Tabs.Tab label="About">
            <Text>{user.company.about}</Text>
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Company;

export const getServerSideProps = withPageAuthRequired();
