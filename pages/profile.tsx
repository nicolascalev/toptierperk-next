import type { NextPage } from "next";
import {
  useMantineTheme,
  Center,
  Paper,
  Text,
  Box,
  Tabs,
  Loader,
  Group,
  Button,
} from "@mantine/core";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useWindowScroll } from "react-use";
import { useState, useEffect } from "react";
import AppUserForm from "components/AppUserForm";
import AppHeaderTitle from "components/AppHeaderTitle";
import api from "config/api";
import useSWR from "swr";
import AppPerkCard from "components/AppPerkCard";
import AppClaimCard from "components/AppClaimCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const fetcher = (url: string, params: any) =>
  api.get(url, { params }).then((res) => res.data);

function UserPicture(props: any) {
  const { y } = useWindowScroll();
  const [logoSize, setLogoSize] = useState(64);
  useEffect(() => {
    if (y < 500) {
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

function Message({ title, message }: { title: string; message: string }) {
  return (
    <Paper withBorder p="md">
      <Text weight={500} mb="sm">
        {title}
      </Text>
      <Text color="dimmed" mb="sm">
        {message}
      </Text>
    </Paper>
  );
}

interface Props {
  user: any;
}

const Profile: NextPage<Props> = ({ user }) => {
  // load saved perks
  const [params, setParams] = useState({
    skip: 0,
    cursor: undefined,
  });
  useEffect(() => {
    setSavedPerks([]);
    setParams({
      skip: 0,
      cursor: undefined,
    });
  }, []);
  const { data: savedPerksData, error: savedPerksError } = useSWR(
    [`/api/user/${user.id}/saved`, params],
    fetcher
  );
  const loadingSaved = !savedPerksData && !savedPerksError;
  const [savedPerks, setSavedPerks] = useState<any>([]);
  const [moreSaved, setMoreSaved] = useState(true);
  useEffect(() => {
    if (savedPerksData) {
      setSavedPerks((perks: any) => [...perks, ...savedPerksData]);
      if (savedPerksData.length === 0) {
        setMoreSaved(false);
      }
    }
  }, [savedPerksData]);
  function loadMoreSaved() {
    setParams({
      skip: 1,
      cursor: savedPerks[savedPerks.length - 1].id,
    });
  }

  // load claims
  const [claimParams, setClaimParams] = useState({
    skip: 0,
    cursor: undefined,
  });
  useEffect(() => {
    setClaims([]);
    setClaimParams({
      skip: 0,
      cursor: undefined,
    });
  }, []);
  const { data: claimsData, error: claimsDataError } = useSWR(
    [`/api/user/${user.id}/claims`, claimParams],
    fetcher
  );
  const loadingClaims = !claimsData && !claimsDataError;
  const [claims, setClaims] = useState<any>([]);
  const [moreClaims, setMoreClaims] = useState(true);
  useEffect(() => {
    if (claimsData) {
      setClaims((claims: any) => [...claims, ...claimsData]);
      if (claimsData.length === 0) {
        setMoreClaims(false);
      }
    }
  }, [claimsData]);
  function loadMoreClaims() {
    setClaimParams({
      skip: 1,
      cursor: claims[claims.length - 1].id,
    });
  }

  const [animationParentSaved] = useAutoAnimate<HTMLDivElement>();
  const [animationParentClaims] = useAutoAnimate<HTMLDivElement>();

  const theme = useMantineTheme();

  const isDark = theme.colorScheme === "dark";

  const logoContainerBg = isDark ? theme.colors.dark[7] : theme.white;

  const tabListStyles: any = {
    position: "sticky",
    top: "112px",
    zIndex: 10,
    backgroundColor: isDark ? theme.colors.dark[7] : theme.white,
    borderBottom: "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da"),
  };

  let tabPanelStyles: any = { minHeight: "calc(100vh - 223px)" };
  if (isDark) {
    tabPanelStyles.backgroundColor = theme.colors.dark[8];
  } else {
    tabPanelStyles.backgroundColor = theme.colors.gray[1];
  }

  return (
    <div style={{ position: "relative", marginBottom: "49px" }}>
      <AppHeaderTitle title={user.username} />
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
        <UserPicture
          logo={
            user.picture?.url ||
            "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
          }
        />
      </Center>
      <Tabs variant="pills" color="primary" defaultValue="claims">
        <Tabs.List grow p="sm" sx={tabListStyles}>
          <Tabs.Tab value="saved">Saved</Tabs.Tab>
          <Tabs.Tab value="claims">Claims</Tabs.Tab>
          <Tabs.Tab value="profile">Profile</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="saved" sx={tabPanelStyles}>
          <Box p="md">
            {loadingSaved && savedPerks.length === 0 && (
              <Group position="center">
                <Loader size="sm" variant="bars"></Loader>
              </Group>
            )}
            {savedPerks.length > 0 && (
              <>
                <div ref={animationParentSaved}>
                  {savedPerks.map((perk: any) => (
                    <AppPerkCard key={perk.id} perk={perk} />
                  ))}
                </div>
                <Button
                  fullWidth
                  disabled={!moreSaved}
                  onClick={loadMoreSaved}
                  loading={loadingSaved}
                >
                  {moreSaved ? "Load more" : "Up to date"}
                </Button>
              </>
            )}
            {!loadingSaved && savedPerks.length === 0 && (
              <Message
                title="No saved items"
                message="When you save perks they will be displayed here"
              />
            )}
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="claims" pt="md" sx={tabPanelStyles}>
          <Box p="md">
            {loadingClaims && claims.length === 0 && (
              <Group position="center">
                <Loader size="sm" variant="bars"></Loader>
              </Group>
            )}
            {claims.length > 0 && (
              <>
                <div ref={animationParentClaims}>
                  {claims.map((claim: any) => (
                    <AppClaimCard key={claim.id} claim={claim} />
                  ))}
                </div>
                <Button
                  fullWidth
                  disabled={!moreClaims}
                  onClick={loadMoreClaims}
                  loading={loadingClaims}
                >
                  {moreClaims ? "Load more" : "Up to date"}
                </Button>
              </>
            )}
            {!loadingClaims && claims.length === 0 && (
              <Message
                title="No claims to show"
                message="When you claim perks they will be displayed here"
              />
            )}
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="profile" pt="md" sx={tabPanelStyles}>
          <Box p="md">
            <AppUserForm user={user} />
          </Box>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default Profile;

export const getServerSideProps = withPageAuthRequired();
