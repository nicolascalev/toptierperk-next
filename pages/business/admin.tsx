import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Text, Box, NavLink, Group, Image } from "@mantine/core";
import { ChevronRight } from "tabler-icons-react";
import Link from "next/link";
import Error from "next/error";

interface Props {
  user: any;
  serverError: any;
}

const BusinessAdmin: NextPage<Props> = ({ user, serverError }) => {
  if (serverError) {
    return <Error statusCode={serverError} />;
  }

  const links: any[] = [
    { url: "/business/profile", label: "Edit profile", disabled: false },
    {
      url: "/business/subscription",
      label: "Manage subscription",
      disabled: false,
    },
    { url: "/perk/create", label: "Create perk", disabled: false },
    {
      url: "/business/admin/offers",
      label: "List your offered perks",
      disabled: false,
    },
    {
      url: "/business/admin/perks",
      label: "Find available perks",
      description: "Perks you can acquire to offer to your employees",
      disabled: false,
    },
    {
      url: "/business/employees",
      label: "Allowed employees",
      description: "List of active and allowed emloyees",
      disabled: false,
    },
    {
      url: "/business/verifiers",
      label: "Allowed verifiers",
      description: "Employees capable of verifying claims",
      disabled: false,
    },
    { url: "/business/analitycs", label: "Analytics", disabled: true },
  ];
  return (
    <Box sx={{ position: "relative", marginBottom: "49px" }}>
      <Group p="md">
        <Image
          src={user.business.logo?.url}
          alt={user.business.name + " Toptierperk"}
          radius={100}
          width={32}
          height={32}
        ></Image>
        <div>
          <Text size="xl" weight={500}>
            {user.adminOf.name} admin
          </Text>
          <Text color="dimmed" size="sm">
            Allowed actions for admins
          </Text>
        </div>
      </Group>
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
