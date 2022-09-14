import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  Text,
  Card,
  Group,
  Button,
  Box,
  Center,
  Loader,
  Container,
  Modal,
  Textarea,
} from "@mantine/core";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AppSubscriptionCard from "components/AppSubscriptionCard";
import confetti from "canvas-confetti";
import { showNotification } from "@mantine/notifications";
import AppHeaderTitle from "components/AppHeaderTitle";
import { Calendar, CheckupList } from "tabler-icons-react";
import api from "config/api";
import useSWR from "swr";
import formatDate from "helpers/formatDate";
import Link from "next/link";
import Joi from "joi";
import { useForm, joiResolver } from "@mantine/form";

const NEXT_PUBLIC_PLAN_ID = process.env.NEXT_PUBLIC_PLAN_ID;
if (!NEXT_PUBLIC_PLAN_ID) {
  throw new Error("NEXT_PUBLIC_PLAN_ID env variable is required");
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const schema = Joi.object({
  reason: Joi.string().min(35).max(124).required(),
});

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface Props {
  user: any;
}

const Subscription: NextPage<Props> = ({ user: sessionUser }) => {
  const [user, setUser] = useState(sessionUser);
  const form = useForm({
    validate: joiResolver(schema),
    initialValues: {
      reason: "",
    },
  });
  const { data: subscription, error: subscriptionError } = useSWR(
    user.adminOf?.paypalSubscriptionId
      ? `/api/business/${user.adminOfId}/subscription`
      : null,
    fetcher
  );
  const loadingSubscription = !subscription && !subscriptionError;

  const [openedCancelSubscription, setOpenedCancelSubscription] =
    useState(false);

  const [loadindCancelSubscription, setLoadingCancelSubscription] =
    useState(false);
  async function onSubmit(e: any) {
    e.preventDefault();
    const errors = form.validate();
    if (errors.hasErrors === true) return;
    const formData = form.values;
    try {
      setLoadingCancelSubscription(true);
      await api.post(`/api/business/${user.adminOfId}/subscription/suspend`, {
        data: formData,
      });
      showNotification({
        title: "You are welcome to come back",
        message: "This window will refresh in 3s",
      });
      form.setFieldValue("reason", "");
      setOpenedCancelSubscription(false);
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 3000);
    } catch (err) {
      showNotification({
        title: "Please try again",
        message: "We could not process your request",
        color: "red",
      });
    } finally {
      setLoadingCancelSubscription(false);
    }
  }

  const [loadingActivate, setLoadingActivate] = useState(false);
  async function activateSubscription() {
    try {
      setLoadingActivate(true);
      await api.post(`/api/business/${user.adminOfId}/subscription/activate`);
      showNotification({
        title: "Your subscription has been activated",
        message: "This window will refresh in 3s",
      });
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 3000);
    } catch (err) {
      console.log(err);
      showNotification({
        title: "Please try again",
        message: "We could not process your request",
        color: "red",
      });
    } finally {
      setLoadingActivate(false);
    }
  }

  // TODO: do other validations
  if (user.adminOf == null) {
    return (
      <>
        <AppHeaderTitle title="Subscription" />
        <Text mx="md">
          You have to be the admin of a business to manage your subscription
        </Text>
      </>
    );
  }

  function onSubscriptionApprove(business: any) {
    setUser({ ...user, ...{ business, adminOf: business } });
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
    <div style={{ minHeight: "calc(100vh - 100px)", marginBottom: "100px" }}>
      <Container>
        <AppHeaderTitle title="Subscription" />

        {user.adminOf?.paypalSubscriptionId && (
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
                    <CheckupList size={12} />
                    Status
                  </Text>
                  <Text size="sm">{subscription.status}</Text>
                </Box>
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
                {subscription.billing_info.next_billing_time && (
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
                )}
                {subscription.billing_info.final_payment_time && (
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
                )}
                {user.adminOf.subscriptionEndsAt && (
                  <Box mt="md">
                    <Text
                      color="dimmed"
                      size="sm"
                      style={{ display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <Calendar size={12} />
                      Active By
                    </Text>
                    <Text size="sm">
                      {formatDate(
                        user.adminOf.subscriptionEndsAt,
                        "SHORT_TEXT"
                      )}
                    </Text>
                  </Box>
                )}
                {subscription.status !== "SUSPENDED" && (
                  <Group mt="md" position="right">
                    <Button
                      variant="default"
                      onClick={() => setOpenedCancelSubscription(true)}
                    >
                      Suspend subscription
                    </Button>
                    <Link href="/business/admin/perks" passHref>
                      <Button component="a">Find perks</Button>
                    </Link>
                  </Group>
                )}
                {subscription.status === "SUSPENDED" && (
                  <Group mt="md" position="right">
                    <Button
                      onClick={activateSubscription}
                      loading={loadingActivate}
                    >
                      Activate
                    </Button>
                  </Group>
                )}
              </Card>
            )}
          </>
        )}
        {!user.adminOf?.paypalSubscriptionId && (
          <>
            <Text my="md">Get a subscription</Text>
            <PayPalScriptProvider
              options={{ "client-id": PAYPAL_CLIENT_ID!, vault: true }}
            >
              <AppSubscriptionCard
                planid={NEXT_PUBLIC_PLAN_ID}
                businessid={user.adminOf.id}
                onSubscriptionApprove={onSubscriptionApprove}
                onSubscriptionError={onSubscriptionError}
              />
            </PayPalScriptProvider>
          </>
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
          We are sorry to see you leave, are you sure you want to cancel your
          subscription?
        </Text>
        <form onSubmit={onSubmit}>
          <Textarea
            mt="md"
            placeholder="Tell us what we can do better"
            label="Reason"
            autosize
            minRows={2}
            maxRows={10}
            {...form.getInputProps("reason")}
          />
          <Group grow mt="md">
            <Button
              variant="default"
              onClick={() => setOpenedCancelSubscription(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              type="submit"
              loading={loadindCancelSubscription}
            >
              Confirm
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default Subscription;

export const getServerSideProps = withPageAuthRequired();
