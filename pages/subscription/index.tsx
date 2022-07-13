import { useState } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme } from "@mantine/core";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AppSubscriptionCard from "../../components/AppSubscriptionCard";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

interface Props {
  user: any;
}

const Subscription: NextPage<Props> = ({ user: sessionUser }) => {
  const theme = useMantineTheme();
  const [user, setUser] = useState(sessionUser);

  // TODO: do other validations
  if (!user.company || user.adminOf == null) {
    return (
      <div>
        You have to be the admin of a company to manage your subscription
      </div>
    );
  }

  function onSubscriptionApprove(company: any) {
    setUser({ ...user, ...{ company } });
  }

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <div style={{ padding: theme.spacing.md }}>
        <h2>Subscription</h2>

        {user.company.paidMembership ? (
          // TODO: get the actual information of the plan od the user
          <p>You have a basic plan</p>
        ) : (
          <PayPalScriptProvider
            options={{ "client-id": PAYPAL_CLIENT_ID!, vault: true }}
          >
            <AppSubscriptionCard
              planid="P-8AT92407XR393120UMLGLXXI"
              companyid={user.company.id}
              onSubscriptionApprove={onSubscriptionApprove}
            />
          </PayPalScriptProvider>
        )}
      </div>
    </div>
  );
};

export default Subscription;

export const getServerSideProps = withPageAuthRequired();
