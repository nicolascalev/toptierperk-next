import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import {
  Box,
  Text,
  TextInput,
  useMantineTheme,
  Drawer,
  Paper,
  Group,
  Button,
  Divider,
  Image,
  Center,
  Loader,
} from "@mantine/core";
import { ChevronRight, UserX } from "tabler-icons-react";
import Error from "next/error";
import AppHeaderTitle from "components/AppHeaderTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import axios from "axios";
import useSWR from "swr";
import refreshSessionUser from "helpers/refreshSessionUser";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/router";

const fetcher = (url: string, params: any) =>
  axios.get(url, { params }).then((res) => res.data);

interface Props {
  user: any;
  serverError: any;
}

const JoinBusinessView: NextPage<Props> = ({ user, serverError }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const listBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];
  const filterBackground = isDark ? theme.colors.dark[7] : theme.white;

  const [searchString, setSearchString] = useState("");
  const [debSearchString] = useDebouncedValue(searchString, 500);
  const [cursor, setCursor] = useState<undefined | number>(undefined);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setBusinesses([]);
    setCursor(undefined);
    setSkip(0);
  }, [debSearchString]);

  const params = useMemo(() => {
    return {
      searchString: debSearchString,
      skip,
      cursor,
    };
  }, [debSearchString, skip, cursor]);

  const { data: businessesData, error: loadingError } = useSWR(
    ["/api/business", params],
    fetcher
  );
  const loadingBusinesses = !businessesData && !loadingError;

  const [theresMore, setTheresMore] = useState(true);
  const [businesses, setBusinesses] = useState<any[]>([]);
  useEffect(() => {
    if (businessesData) {
      if (businessesData.length == 0) {
        setTheresMore(false);
      } else {
        setTheresMore(true);
      }
      setBusinesses((businesses) => [...businesses, ...businessesData]);
    }
  }, [businessesData]);

  function loadMore() {
    setCursor(businesses[businesses.length - 1]?.id || undefined);
    setSkip(1);
  }

  function onClickJoin(business: any) {
    const allowedEmails = JSON.parse(business.allowedEmployeeEmails);
    if (!allowedEmails.includes(user.email)) {
      showNotification({
        title: "Not allowed",
        message:
          "Your email is not in the allowed email list for this business",
        color: "red",
        autoClose: 5000,
      });
      return;
    }
    joinBusiness(business.id);
  }

  const [loadingJoin, setLoadingJoin] = useState(false);
  const [joiningBusinessId, setJoiningBusinessId] = useState<null | number>(
    null
  );
  async function joinBusiness(businessId: number) {
    try {
      setJoiningBusinessId(businessId);
      setLoadingJoin(true);
      await axios
        .patch(`/api/user/${user.id}/business/${businessId}`)
        .then((res) => res.data);
      showNotification({
        title: "Joined business",
        message: "You will be redirected to business page in 3 seconds",
        autoClose: 3000,
      });
      setTimeout(() => {
        router.push("/business");
      }, 3000);
    } catch (err) {
      showNotification({
        title: "Request failed",
        message: "We could not process your request, please try again",
        color: "red",
        autoClose: 5000,
      });
    } finally {
      setJoiningBusinessId(null);
      setLoadingJoin(false);
    }
  }

  return (
    <>
      {serverError ? (
        <Error statusCode={serverError} />
      ) : (
        <Box sx={{ marginBottom: "49px" }}>
          <AppHeaderTitle title="Join Business" />
          <Box
            p="md"
            style={{
              position: "sticky",
              top: "49px",
              backgroundColor: filterBackground,
              zIndex: 10,
            }}
          >
            <TextInput
              value={searchString}
              onChange={(e) => setSearchString(e.currentTarget.value)}
              placeholder="Find business by name"
            />
          </Box>

          {/* display business list */}
          <Box
            p="md"
            sx={{
              backgroundColor: listBackground,
              minHeight: "calc(100vh - 168px)",
            }}
          >
            <div ref={animationParent}>
              {businesses.map((business: any, index: number) => (
                <div key={index}>
                  <Group pt="sm" pb="sm" align="center" noWrap>
                    <Image
                      width={34}
                      height={34}
                      radius={34}
                      fit="cover"
                      src={business.logo.url}
                      alt={business.name}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <Text style={{ width: "100%", wordBreak: "break-word" }}>
                        {business.name}
                      </Text>
                      <Text
                        color="dimmed"
                        size="sm"
                        style={{ width: "100%", wordBreak: "break-word" }}
                      >
                        {business.email}
                      </Text>
                    </div>
                    <Button
                      variant="subtle"
                      onClick={() => onClickJoin(business)}
                      loading={loadingJoin && business.id === joiningBusinessId}
                      disabled={loadingJoin}
                    >
                      Join
                    </Button>
                  </Group>
                  <Divider />
                </div>
              ))}
            </div>
            {/* loader for initial load */}
            {loadingBusinesses && businesses.length === 0 && (
              <Center>
                <Loader size="sm" variant="bars"></Loader>
              </Center>
            )}
            {/* no results with no search string */}
            {!loadingBusinesses && businesses.length === 0 && !debSearchString && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} mb="sm">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When we have businesses to show they will be displayed here
                </Text>
              </Paper>
            )}
            {/* no results with search string */}
            {!loadingBusinesses && businesses.length === 0 && debSearchString && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} mb="sm">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When we have businesses that match that search criteria they
                  will be displayed here
                </Text>
              </Paper>
            )}
            {businesses.length > 0 && (
              <Button
                mt="md"
                fullWidth
                loading={loadingBusinesses}
                disabled={!theresMore}
                onClick={loadMore}
              >
                {theresMore ? "Load more" : "Up to date"}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default JoinBusinessView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx: any) {
    const errorRedirectUrl = await refreshSessionUser(ctx.req, ctx.res);
    if (errorRedirectUrl) {
      return {
        redirect: {
          destination: "/email-verify",
          permanent: false,
        },
      };
    }
    const session = getSession(ctx.req, ctx.res);
    if (session?.user.businessId) {
      return { redirect: { destination: "/business", permanent: false } };
    }
    return { props: { serverError: 0 } };
  },
});
