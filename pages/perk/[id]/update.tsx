import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { useMantineTheme, Text, Box, Loader, Center } from "@mantine/core";
import AppPerkForm from "components/AppPerkForm";
import axios from "axios";
import Benefit from "prisma/models/Benefit";

interface Props {
  user: any;
}

function useFetchPerk(perkId: string) {
  const [loadingPerk, setLoadingPerk] = useState(false);
  const [perk, setPerk] = useState(null);
  const [loadPerkError, setLoadPerkError] = useState<any>(null);
  useEffect(() => {
    async function loadPerk() {
      setLoadingPerk(true);
      setLoadPerkError(null);
      try {
        const { data } = await axios.get("/api/benefit/" + perkId);
        setPerk(data);
      } catch (err) {
        setLoadPerkError((err as any).response);
      } finally {
        setLoadingPerk(false);
      }
    }
    loadPerk();
  }, [perkId]);
  return {
    loadingPerk,
    perk,
    loadPerkError,
  };
}

const UpdatePerkPage: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { loadingPerk, perk, loadPerkError } = useFetchPerk(
    router.query.id as string
  );

  return (
    <div style={{ marginBottom: "49px" }}>
      <Box p="md">
        <Text size="xl" mb={0}>Update Perk</Text>
      </Box>
      {loadingPerk && (
        <Center>
          <Loader size="sm" variant="bars"></Loader>
        </Center>
      )}
      {perk && !loadPerkError && (
        <AppPerkForm action="update" perk={perk}></AppPerkForm>
      )}
    </div>
  );
};

export default UpdatePerkPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    try {
      const session = getSession(ctx.req, ctx.res);
      const perkId = Number(ctx.query.id);
      const perk = await Benefit.findById(perkId);
      if (!perk) {
        return { redirect: { destination: '/404', permanent: false } };
      }
      if (perk.supplier.id !== session!.user.adminOfId) {
        return { redirect: { destination: '/403', permanent: false } };
      }
  
      return { props: {} };
    } catch (err) {
      throw err;
    }
  },
});
