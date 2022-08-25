import type { NextPage } from "next";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import Business from "prisma/models/Business";
import {
  useMantineTheme,
  Image,
  Text,
  Paper,
  Tabs,
  SimpleGrid,
  Alert,
  Center,
  Box,
  Anchor,
  Button,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useWindowScroll } from "react-use";
import { AlertCircle } from "tabler-icons-react";
import { useRouter } from "next/router";
import AppPerkCard from "components/AppPerkCard";
import Link from "next/link";
import AppHeaderTitle from "components/AppHeaderTitle";
import NumericLabel from "react-pretty-numbers";

interface Props {
  user: any;
  business?: any;
}

function BusinessLogo(props: any) {
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
        style={{ backgroundImage: `url('${props.logo}')` }}
      ></div>
    </div>
  );
}

const BusinessView: NextPage<Props> = ({ user, business }) => {
  const theme = useMantineTheme();
  const router = useRouter();

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

  let tabPanelStyles: any = { minHeight: "calc(100vh - 305px)" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  if (!user.business) {
    return (
      <Box p="md">
        <AppHeaderTitle title="Toptierperk" />
        <Paper p="md" withBorder>
          <Text weight={500} mb="sm">
            Business not set
          </Text>
          <Text>
            You are not a part of a business yet, you can either
            <Link href="/business/join" passHref>
              <Anchor component="a"> join a business </Anchor>
            </Link>
            or
            <Link href="/business/create" passHref>
              <Anchor component="a"> create one</Anchor>
            </Link>
          </Text>
        </Paper>
      </Box>
    );
  }

  return (
    <div style={{ position: "relative", marginBottom: "49px" }}>
      <AppHeaderTitle title={business.name} />
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
        <BusinessLogo
          logo={
            business.logo?.url ||
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
          <Paper radius="md" p="md">
            <SimpleGrid cols={3}>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business._count.benefitsFrom}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Perks
                </Text>
              </div>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business._count.benefits}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Offers
                </Text>
              </div>
              <div>
                <Text size="lg">
                  <NumericLabel
                    params={{
                      currency: false,
                      commafy: true,
                      shortFormat: true,
                      justification: "L",
                    }}
                  >
                    {business.claimAmount}
                  </NumericLabel>
                </Text>
                <Text size="sm" color="dimmed">
                  Claims
                </Text>
              </div>
            </SimpleGrid>
          </Paper>
        </div>

        {user.adminOf && user.business?.paidMembership == false && (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Subscription"
            color="yellow"
            radius="md"
            style={{ marginTop: theme.spacing.md, position: "initial" }}
            onClick={() => router.push("/subscription")}
          >
            You need to
            <Link href="/subscription" passHref>
              <Anchor component="a"> get a subscription </Anchor>
            </Link>
            to show offers and get perks.
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
          <Text color="dimmed" px="md" size="sm">
            10 Newest Perks
          </Text>
          {business.benefitsFrom.length === 0 && (
            <Text align="center">0 results found</Text>
          )}
          {business.benefitsFrom.map((perk: any) => (
            <AppPerkCard key={perk.id} perk={perk}></AppPerkCard>
          ))}
          {business.benefitsFrom.length < business._count.benefitsFrom && (
            <Link href="/" passHref>
              <Button component="a">More</Button>
            </Link>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="offers" pt="md" sx={tabPanelStyles}>
          <Text color="dimmed" px="md" size="sm">
            All Business Offers
          </Text>
          {business.benefits.length === 0 && (
            <Text align="center">0 results found</Text>
          )}
          {business.benefits.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer}></AppPerkCard>
          ))}
        </Tabs.Panel>
        <Tabs.Panel value="about" p="md" sx={tabPanelStyles}>
          <Text style={{ whiteSpace: "pre-wrap" }}>{user.business.about}</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default BusinessView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    try {
      const session = getSession(ctx.req, ctx.res);
      const businessId = session!.user.business?.id;
      if (!businessId) {
        return { props: { business: null } };
      }
      const business: any = await Business.getProfile(businessId);
      const parseDate = (perk: any) => {
        perk.createdAt = perk.createdAt.getTime();
      };
      business?.benefits.forEach(parseDate);
      business?.benefitsFrom.forEach(parseDate);

      return { props: { business } };
    } catch (err) {
      throw err;
    }
  },
});
