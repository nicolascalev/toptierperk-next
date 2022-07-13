import { useMantineTheme, Card, Text, List, Title } from "@mantine/core";
import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function AppSubscriptionCard(props: any) {
  const theme = useMantineTheme();
  if (!props.planid || !props.companyid) {
    throw new Error("planid and companyid for PayPal plan is required");
  }
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div>
        There has been a third party error to display your subscription, if the
        error persists please let us know
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
      const { data: updateData } = await axios.patch(`/api/company/${props.companyid}/subscription`, {
        subscriptionId: data.subscriptionID
      })
      if (updateData) {
        props.onSubscriptionApprove(updateData)
        // TODO: show celebration animation
      }
    } catch (err) {
      alert("You got a subscription but we could not store it in our system")
    }
  }

  // TODO: add on error or on reject handler

  return (
    <Card shadow="md">
      <Title order={1} align="center">
        $2.00
      </Title>
      <Text size="lg" weight={500} align="center">
        Basic Plan
      </Text>
      <List style={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md }}>
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
