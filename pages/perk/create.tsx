import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Text, Box } from "@mantine/core";
import AppPerkForm from "components/AppPerkForm";

interface Props {
  user: any;
}

const CreatePerkPage: NextPage<Props> = ({ user }) => {

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <Box p="md">
        <Text size="xl" weight={500}>Create perk</Text>
      </Box>
      {user.adminOf ? (
        <AppPerkForm action="create"></AppPerkForm>
      ) : (
        <Box p="md">
          <Text>You have to be a company admin to create a perk</Text>
        </Box>
      )}
    </div>
  );
};

export default CreatePerkPage;

export const getServerSideProps = withPageAuthRequired();
