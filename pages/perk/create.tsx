import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Text,
  Box,
  Alert,
  useMantineTheme,
  Anchor,
  Paper,
} from "@mantine/core";
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

  return (
    <div style={{ minHeight: "calc(100vh - 98px)", marginBottom: "49px" }}>
      <Box p="md">
        <Text size="xl" weight={500}>
          Create perk
        </Text>
      </Box>
      {user.adminOf && user.adminOf.paidMembership && (
        <AppPerkForm action="create"></AppPerkForm>
      )}
      {!user.adminOf && (
        <Paper p="md" withBorder>
          <Text weight={500} mb="sm">
            Not a business admin
          </Text>
          <Text size="sm" color="dimmed">
            You have to be a business admin to create a perk
          </Text>
        </Paper>
      )}
      {user.adminOf && user.business?.paidMembership == false && (
        <Paper p="md" mx="md" withBorder onClick={() => router.push("/subscription")}>
          <Text weight={500} mb="sm">
            Subscription issue
          </Text>
          <Text size="sm" color="dimmed">
            You need to
            <Link href="/subscription" passHref>
              <Anchor component="a"> have a paid subscription </Anchor>
            </Link>
            to create perk offers.
          </Text>
        </Paper>
      )}
    </div>
  );
};

export default CreatePerkPage;

export const getServerSideProps = withPageAuthRequired();
