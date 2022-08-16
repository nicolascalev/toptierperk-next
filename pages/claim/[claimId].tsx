import Claim from "prisma/models/Claim";
import type { NextPage } from "next";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { Box, Center, Loader, Text } from "@mantine/core";
import axios from "axios";
import useSWR from "swr";
import formatDate from "helpers/formatDate";
import AppPerkCard from "components/AppPerkCard";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface Props {
  user: any;
}

const ClaimView: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const { data: claim, error } = useSWR(
    "/api/claim/" + router.query.claimId,
    fetcher
  );
  const loadingClaim = !claim && !error;

  return (
    <Box p="md" mb={49}>
      <Text size="xl" weight={500} mb="xl">
        Claim details
      </Text>
      {loadingClaim && (
        <Center>
          <Loader variant="bars" size="sm"></Loader>
        </Center>
      )}
      {claim && (
        <>
          <Box mb="md">
            <Text size="sm" weight={500}>Created At</Text>
            <Text color="dimmed">{formatDate(claim.createdAt, "SHORT_TEXT")}</Text>
          </Box>
          <Box mb="md">
            <Text size="sm" weight={500}>Supplier</Text>
            <Text color="dimmed">{claim.supplier.name}</Text>
          </Box>
          <Box mb="md">
            <Text size="sm" weight={500} mb="xs">Perk</Text>
            <AppPerkCard perk={claim.benefit} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ClaimView;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx: any) {
    const session = getSession(ctx.req, ctx.res);
    const claimId = Number(ctx.params.claimId);
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return { redirect: { destination: "/404", permanent: false } };
    }
    if (session!.user.id !== claim!.userId) {
      return { redirect: { destination: "/403", permanent: false } };
    }
    return { props: {} };
  },
});
