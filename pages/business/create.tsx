import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme, Text } from "@mantine/core";
import AppBusinessForm from "components/AppBusinessForm";
import confetti from "canvas-confetti";
import { showNotification } from "@mantine/notifications";

interface Props {
  user: any;
}

const BusinessCreate: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();

  function handleOnSuccess() {
    showNotification({
      title: "Business created 🎉",
      message:
        "Congratulations! You will be redirected in 3s",
      color: "green",
      autoClose: 3000,
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    // router.push("/business");
    // not using router because this will help refresh session
    setTimeout(() => {
      window.location.href = "/business";
    }, 3000);
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
      <Text weight={500} size="xl" mb="md">
        Create business
      </Text>
      <AppBusinessForm
        action="create"
        onSuccess={handleOnSuccess}
        onError={(error) => handleOnError(error)}
      ></AppBusinessForm>
    </div>
  );
};

export default BusinessCreate;

export const getServerSideProps = withPageAuthRequired();
