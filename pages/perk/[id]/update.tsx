import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import { useMantineTheme, Text, Loader, Center } from "@mantine/core";
import AppPerkForm from "components/AppPerkForm";
import axios from "axios";
import Error from 'next/error'

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
  const {
    loadingPerk,
    perk,
    loadPerkError,
  } = useFetchPerk(router.query.id as string);

  return (
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <div style={{ padding: theme.spacing.md }}>
        <h2 style={{ marginBottom: 0 }}>Update Perk</h2>
      </div>
      {loadingPerk && <Center><Loader></Loader></Center>}
      {loadPerkError && <Error statusCode={loadPerkError.status}></Error>}
      {/* TODO: pass perk to AppPerkForm for update */}
      {perk && !loadPerkError && (
        <AppPerkForm action="update" perk={perk}></AppPerkForm>
      )}
    </div>
  );
};

export default UpdatePerkPage;

// TODO add auth guard on server side so the perk info is not fetched, adminOf should be perk.suplier.id
export const getServerSideProps = withPageAuthRequired();
