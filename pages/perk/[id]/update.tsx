import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { useMantineTheme, Text, Loader, Center } from "@mantine/core";
import AppPerkForm from "components/AppPerkForm";
import axios from "axios";
import Error from "next/error";
import Benefit from "prisma/models/Benefit";

interface Props {
  user: any;
  serverError: any;
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

const UpdatePerkPage: NextPage<Props> = ({ user, serverError }) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const { loadingPerk, perk, loadPerkError } = useFetchPerk(
    router.query.id as string
  );

  if (serverError) {
    return (<Error statusCode={serverError}></Error>)
  }

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <div style={{ padding: theme.spacing.md }}>
        <h2 style={{ marginBottom: 0 }}>Update Perk</h2>
      </div>
      {loadingPerk && (
        <Center>
          <Loader></Loader>
        </Center>
      )}
      {loadPerkError && <Error statusCode={loadPerkError.status}></Error>}
      {/* TODO: pass perk to AppPerkForm for update */}
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
        return { props: { serverError: 404 } }
      }
      if (perk.supplier.id !== session!.user.adminOfId) {
        return { props: { serverError: 403 } };
      }
  
      return { props: { serverError: 0 } };
    } catch (err) {
      throw err;
    }
  },
});