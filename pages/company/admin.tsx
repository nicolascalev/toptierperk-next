import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Text, Box, NavLink } from "@mantine/core";
import { ChevronRight } from "tabler-icons-react";
import Link from "next/link";
import Error from "next/error"

interface Props {
  user: any;
  serverError: any;
}

const CompanyAdmin: NextPage<Props> = ({ user, serverError }) => {
  if (serverError) {
    return <Error statusCode={serverError} />
  }
  return (
    <Box sx={{ position: "relative", marginBottom: "49px" }}>
      <Text p="md" size="xl" weight={500}>
        {user.adminOf.name} Admin
      </Text>
      <Box p="sm">
        <Link href="/company/profile" passHref>
          <NavLink component="a" label="Edit profile" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/subscription" passHref>
          <NavLink component="a" label="Manage subscription" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/admin/offers" passHref>
          <NavLink component="a" label="List offered perks" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/admin/available-perks" passHref>
          <NavLink component="a" label="Find available perks" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/admin/acquired-perks" passHref>
          <NavLink component="a" label="Find acquired perks" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/perk/create" passHref>
          <NavLink component="a" label="Create perk" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/employees" passHref>
          <NavLink component="a" label="Allowed employees" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/verifiers" passHref>
          <NavLink component="a" label="Allowed verifiers" rightSection={<ChevronRight size={12} />} />
        </Link>
        <Link href="/company/analitycs" passHref>
          <NavLink component="a" label="Analytics" disabled rightSection={<ChevronRight size={12} />} />
        </Link>
      </Box>
    </Box>
  );
};

export default CompanyAdmin;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { props: { serverError: 401 }}
    }
    return { props: { serverError: 0 }}
  },
});
