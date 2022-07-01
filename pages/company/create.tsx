import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme } from "@mantine/core";
import AppCompanyForm from "../../components/AppCompanyForm";
import confetti from "canvas-confetti";
import { showNotification } from "@mantine/notifications";
import { useRouter } from 'next/router'

interface Props {
  user: any;
}

const CompanyCreate: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter()

  function handleOnSuccess() {
    showNotification({
      title: "Company created 🎉",
      message:
        "Congratulations, you added your company, now you can get a subscription.",
      color: "green",
      autoClose: 5000,
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    router.push("/company")
  }

  function handleOnError(error: any) {
    showNotification({
      title: "Sorry, please try again",
      message:
        "There was an error processing your form, if the error persists pelease contact us.",
      color: "red",
      autoClose: 5000,
    });
  }

  return (
    <div style={{ marginBottom: "49px", padding: theme.spacing.md }}>
      <h2>Create Company</h2>
      <AppCompanyForm
        action="create"
        onSuccess={handleOnSuccess}
        onError={(error) => handleOnError(error)}
      ></AppCompanyForm>
    </div>
  );
};

export default CompanyCreate;

export const getServerSideProps = withPageAuthRequired();
