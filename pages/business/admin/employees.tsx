import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import {
  Box,
  Text,
  TextInput,
  useMantineTheme,
  Group,
  Button,
  Divider,
  Center,
  Loader,
  Paper,
} from "@mantine/core";
import Error from "next/error";
import AppHeaderTitle from "components/AppHeaderTitle";
import { useEffect, useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import axios from "axios";
import refreshSessionUser from "helpers/refreshSessionUser";
import AppEmployeeUpdateButton from "components/AppEmployeeUpdateButton";
import { useDebouncedValue } from "@mantine/hooks";
import useSWR from "swr";
import { User } from "@prisma/client";

const fetcher = (url: string, params: any) =>
  axios.get(url, { params }).then((res) => res.data);

interface Props {
  user: any;
  serverError: any;
}

const EmployeesView: NextPage<Props> = ({ user, serverError }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const listBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

  const [searchString, setSearchString] = useState("");
  const [debSearchString] = useDebouncedValue(searchString, 500);
  const [cursor, setCursor] = useState<undefined | number>(undefined);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setEmployees([]);
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

  const { data: employeesData, error: loadingError } = useSWR<User[]>(
    [`/api/business/${user.adminOfId}/employees`, params],
    fetcher
  );
  const loadingEmployees = !employeesData && !loadingError;

  const [theresMore, setTheresMore] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);
  useEffect(() => {
    if (employeesData) {
      if (employeesData.length == 0) {
        setTheresMore(false);
      } else {
        setTheresMore(true);
      }
      setEmployees((employees) => [...employees, ...employeesData]);
    }
  }, [employeesData]);

  function loadMore() {
    setCursor(employees[employees.length - 1]?.id || undefined);
    setSkip(1);
  }

  function onRemoveEmployee(employeeId: number) {
    setEmployees((employees) =>
      employees.filter((employee: User) => employee.id !== employeeId)
    );
  }

  return (
    <>
      {serverError ? (
        <Error statusCode={serverError} />
      ) : (
        <Box sx={{ marginBottom: "49px" }}>
          <AppHeaderTitle title="Employees" />
          <Box p="md">
            <TextInput
              value={searchString}
              onInput={(e) => setSearchString(e.currentTarget.value)}
              placeholder="Find by name or email"
            />
          </Box>

          {/* display email list */}
          <Box
            p="md"
            sx={{
              backgroundColor: listBackground,
              minHeight: "calc(100vh - 168px)",
            }}
          >
            <div ref={animationParent}>
              {employees.map((employee: User) => (
                <div key={employee.id}>
                  <Group pt="sm" pb="sm" align="center" noWrap>
                    <div style={{ flexGrow: 1 }}>
                      <Text
                        style={{
                          wordWrap: "break-word",
                          width: "calc(100% - 32px)",
                        }}
                      >
                        {employee.name}
                      </Text>
                      <Text size="sm" color="dimmed">
                        {employee.email}
                      </Text>
                    </div>
                    <AppEmployeeUpdateButton
                      user={employee}
                      businessId={user.adminOfId}
                      sessionUserId={user.id}
                      onRemoveEmployee={onRemoveEmployee}
                    />
                  </Group>
                  <Divider />
                </div>
              ))}
            </div>
            {/* loader for initial load */}
            {loadingEmployees && employees.length === 0 && (
              <Center>
                <Loader size="sm" variant="bars"></Loader>
              </Center>
            )}
            {/* no results with no search string */}
            {!loadingEmployees && employees.length === 0 && !debSearchString && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} mb="sm">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When a user joins your business it will be displayed here
                </Text>
              </Paper>
            )}
            {/* no results with search string */}
            {!loadingEmployees && employees.length === 0 && debSearchString && (
              <Paper withBorder p="md" mb="md">
                <Text weight={500} mb="sm">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When a user that matched that criteria joins your business it
                  will be displayed here
                </Text>
              </Paper>
            )}
            {employees.length > 0 && (
              <Button
                mt="md"
                fullWidth
                loading={loadingEmployees}
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

export default EmployeesView;

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
