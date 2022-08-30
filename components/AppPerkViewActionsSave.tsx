import { NavLink } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Bookmark } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import api from "config/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then((res) => res.data);
function useSavedStatus(userId?: number, benefitId?: number) {
  const { data, error } = useSWR(
    userId && benefitId ? `/api/user/${userId}/saved/${benefitId}` : null,
    fetcher
  );
  const loading = userId && benefitId && !data && !error ? true : false;
  return {
    perkSaved: data,
    perkSavedLoading: loading,
  };
}

type Props = {
  perk: any;
  user: any;
};

function AppPerkViewActionsSave({ perk, user }: Props) {
  const router = useRouter();
  const { perkSaved } = useSavedStatus(user?.id, perk?.id);
  const [perkSavedStatus, setPerkSavedStatus] = useState(false);
  useEffect(() => {
    if (perkSaved) {
      setPerkSavedStatus(perkSaved.saved);
    }
  }, [perkSaved]);

  const [loadingSave, setLoadingSave] = useState(false);
  function onClickSave() {
    if (!user) {
      return router.push("/api/auth/login");
    }
    if (perkSavedStatus == false) {
      savePerk();
    } else {
      removeFromSaved();
    }
  }
  async function savePerk() {
    try {
      setLoadingSave(true);
      await api
        .post(`/api/user/${user.id}/saved/${perk.id}`)
        .then((res) => res.data);
      setPerkSavedStatus(true);
    } catch (err) {
      showNotification({
        title: "Opps",
        message: "We could not process your request",
        autoClose: 3000,
      });
    } finally {
      setLoadingSave(false);
    }
  }
  async function removeFromSaved() {
    try {
      setLoadingSave(true);
      await api
        .delete(`/api/user/${user.id}/saved/${perk.id}`)
        .then((res) => res.data);
      setPerkSavedStatus(false);
    } catch (err) {
      showNotification({
        title: "Opps",
        message: "We could not process your request",
        autoClose: 3000,
      });
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <NavLink
      disabled={loadingSave}
      label={perkSavedStatus == true ? "Remove from saved" : "Save"}
      icon={<Bookmark size={16} />}
      onClick={onClickSave}
    />
  );
}

export default AppPerkViewActionsSave;
