import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  useMantineTheme,
  Text,
  Card,
  Group,
  Button,
  Box,
  LoadingOverlay,
  Center,
  Loader,
  Container,
  Modal,
} from "@mantine/core";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AppSubscriptionCard from "components/AppSubscriptionCard";
import confetti from "canvas-confetti";
import { showNotification } from "@mantine/notifications";
import AppHeaderTitle from "components/AppHeaderTitle";
import { Calendar } from "tabler-icons-react";
import api from "config/api";
import useSWR from "swr";
import formatDate from "helpers/formatDate";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface Props {
  user: any;
}

const Subscription: NextPage<Props> = ({ user: sessionUser }) => {
  const theme = useMantineTheme();
  const [user, setUser] = useState(sessionUser);
  const { data: subscription, error: subscriptionError } = useSWR(
    user.adminOf?.paypalSubscriptionId
      ? `/api/business/${user.adminOfId}/subscription`
      : null,
    fetcher
  );
  const loadingSubscription = !subscription && !subscriptionError;

  const [openedCancelSubscription, setOpenedCancelSubscription] =
    useState(false);

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
    <div style={{ minHeight: "calc(100vh - 100px)", marginBottom: "49px" }}>
      <Container>
        <AppHeaderTitle title="Subscription" />

        {user.adminOf?.paypalSubscriptionId ? (
          <>
            {loadingSubscription && (
              <Center>
                <Loader variant="bars" size="sm"></Loader>
              </Center>
            )}
            {!loadingSubscription && (
              <Card withBorder p="md">
                <Text>{user.adminOf.name}</Text>
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
                  <Text size="sm">
                    {formatDate(
                      subscription.billing_info.last_payment.time,
                      "SHORT_TEXT"
                    )}
                  </Text>
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
                  <Text size="sm">
                    {formatDate(
                      subscription.billing_info.next_billing_time,
                      "SHORT_TEXT"
                    )}
                  </Text>
                </Box>
                <Box mt="md">
                  <Text
                    color="dimmed"
                    size="sm"
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <Calendar size={12} />
                    Final payment date
                  </Text>
                  <Text size="sm">
                    {formatDate(
                      subscription.billing_info.final_payment_time,
                      "SHORT_TEXT"
                    )}
                  </Text>
                </Box>
                <Group mt="md">
                  <Button
                    variant="default"
                    onClick={() => setOpenedCancelSubscription(true)}
                  >
                    Cancel subscription
                  </Button>
                  <Link href="/business/admin/perks" passHref>
                    <Button component="a">Find perks</Button>
                  </Link>
                </Group>
              </Card>
            )}
          </>
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
      </Container>

      <Modal
        opened={openedCancelSubscription}
        onClose={() => setOpenedCancelSubscription(false)}
        title="Cancel subscription"
      >
        <Text mb="sm">
          If you want to reactivate your subscription, you will have to reach
          out for support, or get a new subscription.
        </Text>
        <Text mb="sm">
          If you still have time left on your subscription, it will still be
          disabled in the system and you will have to reach out to us in order
          to give you access for the days you had left.
        </Text>
        <Text>
          We are sorry to see you leave, are you sure you want to cancel your
          subscription?
        </Text>
        <Group grow mt="md">
          <Button
            variant="default"
            onClick={() => setOpenedCancelSubscription(false)}
          >
            Cancel
          </Button>
          <Button color="red">Confirm</Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Subscription;

export const getServerSideProps = withPageAuthRequired();
