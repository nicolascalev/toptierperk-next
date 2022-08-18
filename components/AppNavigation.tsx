import { ScrollArea, Box, NavLink } from "@mantine/core";
import Link from "next/link";
import { BuildingSkyscraper, Scan, Logout, Login } from "tabler-icons-react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0";

function AppNavigation(props: any) {
  const router = useRouter();
  const { user } = useUser();
  return (
    <ScrollArea style={{ height: 282 }}>
      <Box>
        {user && (
          <>
            <Link href="/business/admin" passHref>
              <NavLink
                component="a"
                variant="subtle"
                label="Your business"
                icon={<BuildingSkyscraper size={14} />}
                active={router.pathname == "/business/admin"}
              />
            </Link>
            <Link href="/scan/claim" passHref>
              <NavLink
                component="a"
                variant="subtle"
                label="Verify Claim QR"
                icon={<Scan size={14} />}
                active={router.pathname == "/scan/claim"}
              />
            </Link>
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
    </ScrollArea>
  );
}

export default AppNavigation;
