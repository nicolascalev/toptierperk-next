import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { Box } from "@mantine/core";
import AppError from "components/AppError";
import AppHeaderTitle from "components/AppHeaderTitle";
import AppBusinessForm from "components/AppBusinessForm";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import Business from "prisma/models/Business";

interface Props {
  user: any;
  serverError: any;
  business: any;
}

const EditBusinessView: NextPage<Props> = ({ user, serverError, business }) => {
  const router = useRouter();
  function onSuccess() {
    showNotification({
      title: "Business updated",
      message: "It may take a second to populate around the app",
    });
    setTimeout(() => {
      router.push("/business");
    }, 5000);
  }
  function onError() {
    showNotification({
      title: "Please try again",
      message: "We could not process your request",
      color: "red",
    });
  }
  return (
    <>
      <AppHeaderTitle title="Update business profile" />
      {serverError !== 0 && (
        <AppError status={serverError} message="Unauthorized" />
      )}
      {!serverError && (
        <Box mb={49} p="md">
          <AppBusinessForm
            action="update"
            businessId={user.adminOfId}
            initialvalues={business}
            disableTermsAndConditions={true}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Box>
      )}
    </>
  );
};

export default EditBusinessView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    if (!session?.user.adminOf) {
      return { props: { serverError: 401, business: null } };
    }

    const business = await Business.findById(session!.user.adminOfId);
    return {
      props: { serverError: 0, business: JSON.parse(JSON.stringify(business)) },
    };
  },
});
