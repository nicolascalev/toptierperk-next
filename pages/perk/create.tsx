import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Text, Box, Alert, useMantineTheme, Anchor } from "@mantine/core";
import AppPerkForm from "components/AppPerkForm";
import { AlertCircle } from "tabler-icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  user: any;
}

const CreatePerkPage: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();

  if (user.adminOf && user.business?.paidMembership == false) {
    return (
      <Box p="md">
        <Alert
          icon={<AlertCircle size={16} />}
          title="Subscription"
          color="yellow"
          radius="md"
          style={{ marginTop: theme.spacing.md, position: "initial" }}
          onClick={() => router.push("/subscription")}
        >
          You need to
          <Link href="/subscription" passHref>
            <Anchor component="a"> get a subscription </Anchor>
          </Link>
          to create perks and offers.
        </Alert>
      </Box>
    );
  }

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <Box p="md">
        <Text size="xl" weight={500}>
          Create perk
        </Text>
      </Box>
      {user.adminOf ? (
        <AppPerkForm action="create"></AppPerkForm>
      ) : (
        <Box p="md">
          <Text>You have to be a business admin to create a perk</Text>
        </Box>
      )}
    </div>
  );
};

export default CreatePerkPage;

export const getServerSideProps = withPageAuthRequired();
