import {
  useMantineTheme,
  Card,
  Text,
  List,
  Title,
  Anchor,
  ThemeIcon,
  Divider,
  Box,
} from "@mantine/core";
import { PayPalButtons } from "@paypal/react-paypal-js";
import api from "config/api";
import { CircleCheck } from "tabler-icons-react";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function AppSubscriptionCard(props: any) {
  const theme = useMantineTheme();
  if (!props.planid || !props.businessid) {
    throw new Error("planid and businessid for PayPal plan is required");
  }
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div>
        There has been a third party error to get a subscription, if the error
        persists please{" "}
        <Anchor color="blue" href="mailto:hello@toptierperk.com">
          let us know
        </Anchor>
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
    <>
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
        }}
        withBorder
      >
        <Card.Section>
          <Box my="xl" px="md">
            <Title order={2}>Full Plan</Title>
            <Text weight={500}>$19.99 plus 13% taxes a month</Text>
          </Box>
          <Divider />
        </Card.Section>
        <List
          spacing="xs"
          size="sm"
          center
          my="3rem"
          icon={
            <ThemeIcon size={24} radius="xl">
              <CircleCheck size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>First month free</List.Item>
          <List.Item>Publish unlimited offers</List.Item>
          <List.Item>Get unlimited perks</List.Item>
          <List.Item>Allow unlimited employees</List.Item>
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
    </>
  );
}

export default AppSubscriptionCard;
