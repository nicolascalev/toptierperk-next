import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Paper, Text } from "@mantine/core";

interface Props {
  user: any;
}
const VerifyEmailView: NextPage<Props> = ({ user }) => {
  return (
    <>
      <Paper m="md" p="md" withBorder>
        <Text weight={500} mb="md">
          Email verification needed
        </Text>
        <Text color="dimmed" size="sm">
          Check your inbox for a confirmation email, make sure you check the
          junk folder too.
        </Text>
      </Paper>
    </>
  );
};

export default VerifyEmailView;

export const getServerSideProps = withPageAuthRequired();
