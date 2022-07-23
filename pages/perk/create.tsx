import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme, Text } from "@mantine/core";
import AppPerkForm from "../../components/AppPerkForm";

interface Props {
  user: any;
}

const CreatePerkPage: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <div style={{ padding: theme.spacing.md }}>
        <h2 style={{ marginBottom: 0 }}>Create Perk</h2>
      </div>
      {user.adminOf ? (
        <AppPerkForm></AppPerkForm>
      ) : (
        <div style={{ padding: theme.spacing.md }}>
          <Text>You have to be a company admin to create a perk</Text>
        </div>
      )}
    </div>
  );
};

export default CreatePerkPage;

export const getServerSideProps = withPageAuthRequired();
