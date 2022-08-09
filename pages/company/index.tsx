import type { NextPage } from "next";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import Company from "prisma/models/Company";
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
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useWindowScroll } from "react-use";
import { AlertCircle } from "tabler-icons-react";
import { useRouter } from "next/router";
import AppPerkCard from "components/AppPerkCard";
import Link from "next/link";

interface Props {
  user: any;
  company?: any;
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

const CompanyView: NextPage<Props> = ({ user, company }) => {
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

  let tabPanelStyles: any = { minHeight: "calc(100vh - 349px)" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  if (!user.company) {
    return (
      <Box p="md">
        <Text>
          You are not a part of a company yet, you can either
          <Link href="/company/join" passHref>
            <Anchor component="a"> join a company </Anchor>
          </Link>
          or
          <Link href="/company/create" passHref>
            <Anchor component="a"> create one.</Anchor>
          </Link>
        </Text>
      </Box>
    );
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
            company.logo?.url ||
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
            {company.name}
          </Text>
          <Paper radius="md" p="md">
            <SimpleGrid cols={3}>
              <div>
                <Text weight="bold" size="lg">
                  {company._count.benefitsFrom}
                </Text>
                <Text>Perks</Text>
              </div>
              <div>
                <Text weight="bold" size="lg">
                  {company._count.benefits}
                </Text>
                <Text>Offers</Text>
              </div>
              <div>
                <Text weight="bold" size="lg">
                  {company.claimAmount}
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
          {company.benefitsFrom.length === 0 && (
            <Text align="center">0 results found</Text>
          )}
          {company.benefitsFrom.map((perk: any) => (
            <AppPerkCard key={perk.id} perk={perk}></AppPerkCard>
          ))}
        </Tabs.Panel>
        <Tabs.Panel value="offers" pt="md" sx={tabPanelStyles}>
          {company.benefits.length === 0 && (
            <Text align="center">0 results found</Text>
          )}
          {company.benefits.map((offer: any) => (
            <AppPerkCard key={offer.id} perk={offer}></AppPerkCard>
          ))}
        </Tabs.Panel>
        <Tabs.Panel value="about" p="md" sx={tabPanelStyles}>
          <Text style={{ whiteSpace: "pre-wrap" }}>{user.company.about}</Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default CompanyView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    try {
      const session = getSession(ctx.req, ctx.res);
      const companyId = session!.user.company?.id;
      if (!companyId) {
        return { props: { company: null } };
      }
      const company = await Company.getProfile(companyId);

      return { props: { company } };
    } catch (err) {
      throw err;
    }
  },
});
