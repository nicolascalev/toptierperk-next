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
} from "@mantine/core";
import { SquarePlus, X } from "tabler-icons-react";
import AppError from "components/AppError";
import AppHeaderTitle from "components/AppHeaderTitle";
import AppLoadExcelEmailsButton from "components/AppLoadExcelEmailsButton";
import { useCallback, useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import api from "config/api";
import { isEqual, sortBy } from "lodash";

interface Props {
  user: any;
  serverError: any;
}

const AllowedEmailsView: NextPage<Props> = ({ user, serverError }) => {
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  const [animationParent] = useAutoAnimate<HTMLDivElement>();
  const listBackground = isDark ? theme.colors.dark[8] : theme.colors.gray[1];

  const initiaAllowedEmails = JSON.parse(user.adminOf.allowedEmployeeEmails);
  const [allowedEmails, setAllowedEmails] =
    useState<string[]>(initiaAllowedEmails);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  useEffect(() => {
    setFilteredEmails(
      allowedEmails.filter((email: string) => email.includes(emailFilter))
    );
  }, [emailFilter, allowedEmails]);

  const [openedAddEmail, setOpenedAddEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const isEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  useEffect(() => {
    const isListed = (email: string) => {
      const found = allowedEmails.find(
        (listedEmail: string) => listedEmail === email
      );
      return found ? true : false;
    };
    if (newEmail && !isEmail(newEmail)) {
      setNewEmailError("The value should be a valid email");
    }
    if (newEmail && isListed(newEmail)) {
      setNewEmailError("That email is already in the list");
    }
    if (!newEmail || (isEmail(newEmail) && !isListed(newEmail))) {
      setNewEmailError("");
    }
  }, [newEmail, allowedEmails]);

  function addEmail(e: any) {
    e.preventDefault();
    setAllowedEmails((emails) => [newEmail, ...emails]);
    setNewEmail("");
    showNotification({
      title: "Added email",
      message: "Remember to save changes",
      autoClose: 2000,
    });
  }

  function removeEmail(email: string) {
    setAllowedEmails(allowedEmails.filter((item: string) => item !== email));
  }

  const existingChanges = !isEqual(
    sortBy(initiaAllowedEmails),
    sortBy(allowedEmails)
  );

  const [loadingUpdateList, setLoadingUpdateList] = useState(false);
  async function updateAllowedEmails() {
    try {
      setLoadingUpdateList(true);
      const updated = await api
        .patch(`/api/business/${user.adminOfId}/allowed-emails`, {
          allowedEmails: JSON.stringify(sortBy(allowedEmails)),
        })
        .then((res) => res.data);
      user.adminOf.allowedEmployeeEmails = JSON.stringify(updated);
      showNotification({
        title: "Updated list",
        message: "Changes have been applied",
        autoClose: 5000,
      });
    } catch (err) {
      showNotification({
        title: "Error",
        message: "Please try again",
        autoClose: 5000,
        color: "red",
      });
    } finally {
      setLoadingUpdateList(false);
    }
  }

  const [processingEmails, setProcessingEmails] = useState(false);
  const isListed = useCallback((email: string) => {
    const found = allowedEmails.find(
      (listedEmail: string) => listedEmail === email
    );
    return found ? true : false;
  }, [allowedEmails]);
  function onReadEmails(readEmails: string[]) {
    console.log("emited on read emails");
    setProcessingEmails(true);
    const nonDuplicateEmails = readEmails.filter((email) => !isListed(email));
    setAllowedEmails((allowed) => [...nonDuplicateEmails, ...allowed]);
    showNotification({
      title: "Emails added",
      message: nonDuplicateEmails.length + " new emails were added",
      autoClose: 3000,
    });
    setProcessingEmails(false);
  }

  return (
    <>
      {serverError ? (
        <AppError status={serverError} message="Unauthorized" />
      ) : (
        <Box sx={{ marginBottom: "49px" }}>
          <AppHeaderTitle title="Allowed emails" />
          <Box p="md">
            <TextInput
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.currentTarget.value)}
              placeholder="Find email"
              description="Emails on this list will be able to join your business"
            />
            <ActionIcon
              color="dark"
              size="md"
              title="Add email"
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                zIndex: 101,
              }}
              onClick={() => setOpenedAddEmail(true)}
            >
              <SquarePlus />
            </ActionIcon>
          </Box>

          {/* display email list */}
          <Box
            p="md"
            sx={{
              backgroundColor: listBackground,
              minHeight: "calc(100vh - 187px)",
            }}
          >
            {!emailFilter && filteredEmails.length === 0 && (
              <Paper withBorder p="md">
                <Text weight={500} mb="md">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When you add an email it will be shown here
                </Text>
              </Paper>
            )}
            {emailFilter && filteredEmails.length === 0 && (
              <Paper withBorder p="md">
                <Text weight={500} mb="md">
                  No results
                </Text>
                <Text color="dimmed" size="sm">
                  When you add an email that matches that criteria it will be
                  shown here
                </Text>
              </Paper>
            )}
            <div ref={animationParent}>
              {filteredEmails.map((email: string) => (
                <div key={email}>
                  <Group pt="sm" pb="sm" noWrap>
                    <ActionIcon
                      color="red"
                      size="xs"
                      radius="lg"
                      variant="outline"
                      onClick={() => removeEmail(email)}
                    >
                      <X size={12} />
                    </ActionIcon>
                    <Text
                      style={{
                        wordWrap: "break-word",
                        width: "calc(100% - 32px)",
                      }}
                    >
                      {email}
                    </Text>
                  </Group>
                  <Divider />
                </div>
              ))}
            </div>
          </Box>

          {/* save changes box */}
          <Box
            sx={{
              width: "100%",
              position: "fixed",
              bottom: "48px",
              backgroundColor: isDark ? theme.colors.dark[7] : "white",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-1.5rem",
                left: "0px",
                width: "100%",
                height: "1.5rem",
                backgroundImage: `linear-gradient(transparent, ${listBackground})`,
              }}
            ></div>
            <Divider />
            <Group p="md" align="center" noWrap spacing="xs">
              <Text sx={{ flexGrow: 1 }}>
                {existingChanges ? "Pending save changes" : "No changes"}
              </Text>
              <Button
                disabled={!existingChanges}
                onClick={updateAllowedEmails}
                loading={loadingUpdateList}
              >
                Save
              </Button>
            </Group>
          </Box>

          <Drawer
            opened={openedAddEmail}
            onClose={() => setOpenedAddEmail(false)}
            title="Add email"
            padding="md"
            size="md"
            position="bottom"
          >
            <form onSubmit={addEmail}>
              <TextInput
                value={newEmail}
                onChange={(e) => setNewEmail(e.currentTarget.value)}
                label="Email"
                placeholder="user@example.com"
                required
                error={newEmailError}
              />
              <Group position="right" pt="sm">
                <Button
                  type="submit"
                  disabled={!newEmail || newEmailError ? true : false}
                >
                  Add
                </Button>
              </Group>
            </form>
            <Box py="sm">
              <AppLoadExcelEmailsButton
                onRead={onReadEmails}
                processing={processingEmails}
              />
            </Box>
          </Drawer>
        </Box>
      )}
    </>
  );
};

export default AllowedEmailsView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx: any) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { props: { serverError: 401 } };
    }
    return { props: { serverError: 0 } };
  },
});
