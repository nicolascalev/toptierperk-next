import { ScrollArea, Box, NavLink } from "@mantine/core";
import Link from "next/link";
import {
  BuildingSkyscraper,
  Scan,
  Logout,
  Login,
  MessageReport,
} from "tabler-icons-react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import AppFeedbackDrawer from "./AppFeedbackDrawer";

function AppNavigation(props: any) {
  const router = useRouter();
  const { user } = useUser();
  const [openedFeedbackDrawer, setOpenedFeedbackDrawer] = useState(false);
  return (
    <ScrollArea style={{ height: 282 }}>
      <Box>
        {user && (
          <>
            {user.adminOfId && (
              <Link href="/business/admin" passHref>
                <NavLink
                  component="a"
                  variant="subtle"
                  label="Business admin"
                  icon={<BuildingSkyscraper size={14} />}
                  active={router.pathname == "/business/admin"}
                />
              </Link>
            )}
            {(user.adminOfId || user.canVerify) && (
              <Link href="/scan/claim" passHref>
                <NavLink
                  component="a"
                  variant="subtle"
                  label="Verify costumer QR"
                  icon={<Scan size={14} />}
                  active={router.pathname == "/scan/claim"}
                />
              </Link>
            )}
            <NavLink
              variant="subtle"
              label="Report issue / feedback"
              icon={<MessageReport size={14} />}
              onClick={() => setOpenedFeedbackDrawer(true)}
            />
            <Link href="/api/auth/logout" passHref>
              <NavLink
                variant="filled"
                color="red"
                component="a"
                label="Logout"
                icon={<Logout size={14} />}
              />
            </Link>
          </>
        )}
        {!user && (
          <Link href="/api/auth/login" passHref>
            <NavLink
              variant="subtle"
              component="a"
              label="Login"
              icon={<Login size={14} />}
            />
          </Link>
        )}
        {props.children}
      </Box>
      <AppFeedbackDrawer
        opened={openedFeedbackDrawer}
        onClose={() => setOpenedFeedbackDrawer(false)}
        onFeedbackCreate={() => setOpenedFeedbackDrawer(false)}
        size="full"
        position="right"
      />
    </ScrollArea>
  );
}

export default AppNavigation;
