import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme, Image, Text, Paper, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { useWindowScroll } from "react-use";
import { debounce } from "lodash";

const useDisplayProfile = () => {
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  const { y } = useWindowScroll();
  const scrollHandle = debounce(() => {
    if (y <= 5) {
      setShowCompanyInfo(true);
    } else {
      setShowCompanyInfo(false);
    }
  }, 200);
  useEffect(() => {
    scrollHandle();
  }, [scrollHandle]);
  const detailsOpacity = showCompanyInfo ? 1 : 0;

  const logoClass = showCompanyInfo ? "logo" : "logo logo__shrink";
  return { showCompanyInfo, detailsOpacity, logoClass };
};

interface Props {
  user: any;
}

const Company: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const { detailsOpacity, logoClass } = useDisplayProfile();

  if (!user.company) {
    return <div>You have to be a part of a company or create one</div>;
  }

  return (
    <div style={{ position: "relative", height: "200vh" }}>
      {user.company.logo && (
        <div
          style={{
            position: "sticky",
            top: "52px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          }}
        >
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
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          opacity: detailsOpacity,
        }}
      >
        <div style={{ width: "100%" }}>
          <Text size="xl" weight={500}>
            {user.company.name}
          </Text>
          <Paper>Perks - Offers - Employees</Paper>
        </div>
      </div>
      <div
        style={{
          position: "sticky",
          top: "89px",
          padding: theme.spacing.md,
        }}
      >
        <Tabs grow variant="pills" position="apart" color="primary">
          <Tabs.Tab label="Newest">
            <div>First tab content</div>
          </Tabs.Tab>
          <Tabs.Tab label="Exclusive">Second tab content</Tabs.Tab>
          <Tabs.Tab label="Popular">Third tab content</Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default Company;

export const getServerSideProps = withPageAuthRequired();
