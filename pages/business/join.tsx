import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import {
  Box,
  Text,
  TextInput,
  ActionIcon,
  useMantineTheme,
  Drawer,
  Paper,
  Group,
  Button,
  Divider,
  Menu,
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

const fetcher = (url: string, params: any) =>
  axios.get(url, { params }).then((res) => res.data);

interface Props {
  user: any;
  serverError: any;
}

const JoinBusinessView: NextPage<Props> = ({ user, serverError }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const listBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

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

  return (
    <>
      {serverError ? (
        <Error statusCode={serverError} />
      ) : (
        <Box sx={{ marginBottom: "49px" }}>
          <AppHeaderTitle title="Join Business" />
          <Box p="md">
            <TextInput
              value={searchString}
              onChange={(e) => setSearchString(e.currentTarget.value)}
              placeholder="Find by name"
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
                    <Text>{business.name}</Text>
                  </Group>
                  <Divider />
                </div>
              ))}
            </div>
            <Button
              fullWidth
              loading={loadingBusinesses}
              disabled={!theresMore}
              onClick={loadMore}
            >
              {theresMore ? "Load more" : "Up to date"}
            </Button>
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
    if (!session?.user.adminOf) {
      return { props: { serverError: 401 } };
    }
    return { props: { serverError: 0 } };
  },
});
