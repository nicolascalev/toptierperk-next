import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Box, NavLink } from "@mantine/core";
import { ChevronRight } from "tabler-icons-react";
import Link from "next/link";
import Error from "next/error";
import AppHeaderTitle from "components/AppHeaderTitle";

interface Props {
  user: any;
  serverError: any;
}

const BusinessAdmin: NextPage<Props> = ({ user, serverError }) => {
  if (serverError) {
    return <Error statusCode={serverError} />;
  }

  const links: any[] = [
    {
      url: "/business/admin/profile",
      label: "Edit business profile",
      disabled: false,
    },
    {
      url: "/subscription",
      label: "Manage subscription",
      disabled: false,
    },
    { url: "/perk/create", label: "Create perk", disabled: false },
    {
      url: "/business/admin/offers",
      label: "List your perk offers",
      description: "These are the perks you offer to other businesses",
      disabled: false,
    },
    {
      url: "/business/admin/perks",
      label: "Find available perks",
      description: "Perks you can acquire to offer to your employees",
      disabled: false,
    },
    {
      url: "/business/admin/allowed-emails",
      label: "Allowed emails",
      description: "Emails on this list can join your business",
      disabled: false,
    },
    {
      url: "/business/admin/employees",
      label: "Allowed employees",
      description: "List of active and allowed emloyees",
      disabled: false,
    },
    { url: "/business/admin/analitycs", label: "Analytics", disabled: true },
  ];
  return (
    <Box sx={{ position: "relative", marginBottom: "49px" }}>
      <AppHeaderTitle title="Admin" />
      <Box p="sm">
        {links.map((link: any, index: number) => (
          <Link key={index} href={link.url} passHref>
            <NavLink
              component="a"
              label={link.label}
              description={link.description || ""}
              rightSection={<ChevronRight size={12} />}
              disabled={link.disabled}
            />
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default BusinessAdmin;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { props: { serverError: 401 } };
    }
    return { props: { serverError: 0 } };
  },
});
