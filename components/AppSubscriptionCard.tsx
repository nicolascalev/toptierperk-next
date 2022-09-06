import { useMantineTheme, Card, Text, List, Title } from "@mantine/core";
import { PayPalButtons } from "@paypal/react-paypal-js";
import api from "config/api";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function AppSubscriptionCard(props: any) {
  const theme = useMantineTheme();
  if (!props.planid || !props.businessid) {
    throw new Error("planid and businessid for PayPal plan is required");
  }
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div>
        There has been a third party error to display your subscription, if the
        error persists please <a href="mailto:hello@toptierperk.com">let us know</a>
      </div>
    );
  }

  function paypalCreateSubscription(data: any, actions: any) {
    return actions.subscription.create({
      plan_id: props.planid,
    });
  }

  async function onPaypalApprove(data: any) {
    try {
      const { data: updateData } = await api.patch(
        `/api/business/${props.businessid}/subscription`,
        {
          subscriptionId: data.subscriptionID,
          lastPaymentDate: data.start_time,
        }
      );
      if (updateData) {
        props.onSubscriptionApprove(updateData);
      }
    } catch (err) {
      props.onSubscriptionError(data.subscriptionID);
    }
  }

  // TODO: add on error or on reject handler
  // TODO: get plan info from props

  return (
    <Card shadow="md">
      <Title order={1} align="center">
        $19.99
      </Title>
      <Text size="lg" weight={500} align="center">
        Basic Plan
      </Text>
      <List
        style={{
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
        }}
      >
        <List.Item>Offer unlimited perks</List.Item>
        <List.Item>Get unlimited perks</List.Item>
        <List.Item>Have unlimited employees</List.Item>
        <List.Item>Have access to experimental features</List.Item>
      </List>
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
        }}
        createSubscription={paypalCreateSubscription}
        onApprove={onPaypalApprove}
      />
    </Card>
  );
}

export default AppSubscriptionCard;
