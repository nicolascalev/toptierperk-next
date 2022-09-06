import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme, Text, Card, Group, Button, Box } from "@mantine/core";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AppSubscriptionCard from "components/AppSubscriptionCard";
import confetti from "canvas-confetti";
import { showNotification } from "@mantine/notifications";
import AppHeaderTitle from "components/AppHeaderTitle";
import { Calendar } from "tabler-icons-react";
import api from "config/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface Props {
  user: any;
}

const Subscription: NextPage<Props> = ({ user: sessionUser }) => {
  const theme = useMantineTheme();
  const [user, setUser] = useState(sessionUser);
  const { data: subscription, error } = useSWR(
    user.adminOfId ? `/api/business/${user.adminOfId}/subscription` : null,
    fetcher
  );
    useEffect(() => {
      console.log(subscription);
    }, [subscription])

  // TODO: do other validations
  if (user.adminOf == null) {
    return (
      <>
        <AppHeaderTitle title="Subscription" />
        <div>
          You have to be the admin of a business to manage your subscription
        </div>
      </>
    );
  }

  function onSubscriptionApprove(business: any) {
    setUser({ ...user, ...{ business } });
    showNotification({
      title: "Subscribed!",
      message: "Congratulations on your new subscription.",
      color: "green",
      autoClose: 5000,
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  function onSubscriptionError() {
    showNotification({
      title: "Oops!",
      message: "There was an error while processing your subscription.",
      color: "red",
      autoClose: 5000,
    });
  }

  return (
    <div style={{ minHeight: "calc(100vh - 98px)", marginBottom: "49px" }}>
      <div style={{ padding: theme.spacing.md }}>
        <AppHeaderTitle title="Subscription" />

        {user.business.paidMembership ? (
          <Card withBorder p="md">
            <Text>You have a full subscription</Text>
            <Box mt="md">
              <Text
                color="dimmed"
                size="sm"
                style={{ display: "flex", alignItems: "center", gap: 3 }}
              >
                <Calendar size={12} />
                Last payment date
              </Text>
              <Text size="sm">Aug 26th, 2022</Text>
            </Box>
            <Box mt="md">
              <Text
                color="dimmed"
                size="sm"
                style={{ display: "flex", alignItems: "center", gap: 3 }}
              >
                <Calendar size={12} />
                Next payment date
              </Text>
              <Text size="sm">Sep 26th, 2022</Text>
            </Box>
            <Group mt="md">
              <Button variant="default">Cancel subscription</Button>
              <Button>Find perks</Button>
            </Group>
          </Card>
        ) : (
          <PayPalScriptProvider
            options={{ "client-id": PAYPAL_CLIENT_ID!, vault: true }}
          >
            <AppSubscriptionCard
              planid="P-8AT92407XR393120UMLGLXXI"
              businessid={user.adminOf.id}
              onSubscriptionApprove={onSubscriptionApprove}
              onSubscriptionError={onSubscriptionError}
            />
          </PayPalScriptProvider>
        )}
      </div>
    </div>
  );
};

export default Subscription;

export const getServerSideProps = withPageAuthRequired();
