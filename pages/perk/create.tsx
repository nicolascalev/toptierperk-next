import type { NextPage } from "next";
import { useMantineTheme} from "@mantine/core";
import AppPerkForm from "../../components/AppPerkForm";

const CreatePerkPage: NextPage = () => {
  const theme = useMantineTheme();

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px"  }}>
      <div style={{ padding: theme.spacing.md }}>
        <h2 style={{ marginBottom: 0 }}>Create Perk</h2>
      </div>
      <AppPerkForm></AppPerkForm>
    </div>
  );
};

export default CreatePerkPage;
