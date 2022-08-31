import { useEffect, useState, useRef } from "react";
import {
  Box,
  Divider,
  Group,
  useMantineTheme,
  Text,
  ActionIcon,
  Button,
  Drawer,
  NavLink,
} from "@mantine/core";
import {
  Bookmark,
  DotsVertical,
  Upload,
  Link as LinkIcon,
  MessageReport,
} from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import api from "config/api";
import useSWR from "swr";
import confetti from "canvas-confetti";
import AppPerkViewActionsSave from "components/AppPerkViewActionsSave";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

function useAcquiredStatus(businessId?: number, benefitId?: number) {
  const { data, error } = useSWR(
    businessId && benefitId
      ? `/api/business/${businessId}/benefits/${benefitId}`
      : null,
    fetcher
  );
  const loading = !data && !error && businessId && benefitId ? true : false;

  return {
    acquireStatus: data,
    loadingAcquireStatus: loading,
  };
}

type Props = {
  perk: any;
  user: any;
  initialError: string;
};
function AppPerkViewActions({ perk, user, initialError }: Props) {
  const router = useRouter();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === "dark";
  // TODO IMPORTANT prevent requests from being sent everytime this is rendered, it goes for actions save too
  const { acquireStatus, loadingAcquireStatus } = useAcquiredStatus(
    user?.businessId,
    perk.id
  );

  const [openedActions, setOpenedActions] = useState(false);

  function clickShare() {
    const shareData = {
      title: perk.name,
      text: "Toptierperk, making B2B perks available for everyone",
      url: window.location.origin + `/perk${perk.id}`,
    };
    navigator
      .share(shareData)
      .then(() => {
        showNotification({
          title: "Shared",
          message: "Thanks for sharing this perk!",
          autoClose: 3000,
        });
      })
      .catch(() => {
        showNotification({
          title: "Not available",
          message: "Sharing is not available for your browser",
          autoClose: 3000,
        });
      })
      .finally(() => setOpenedActions(false));
  }

  function clickCopyUrl() {
    navigator.clipboard
      .writeText(window.location.origin + `/perk${perk.id}`)
      .then(() => {
        showNotification({
          title: "Copied",
          message: "Url copied to keyboard",
          autoClose: 3000,
        });
      })
      .catch(() => {
        showNotification({
          title: "Oops",
          message: "Could not copy to keyboard",
          autoClose: 3000,
        });
      })
      .finally(() => setOpenedActions(false));
  }

  function onClickClaim() {
    if (!user) {
      return router.push("/api/auth/login");
    }
    if (!user.emailVerified) {
      return showNotification({
        title: "Not allowed",
        message: "You need to verify your email address first",
        autoClose: 3000,
      });
    }
    if (!user.business) {
      return showNotification({
        title: "Not allowed",
        message: "You must belong to a business first to claim any perk",
        autoClose: 3000,
      });
    }
    if (!acquireStatus?.perkIsAcquired) {
      return showNotification({
        title: "Not allowed",
        message: "Your employeer has not acquired this perk",
        autoClose: 3000,
      });
    }
    if (initialError) {
      return showNotification({
        title: "Not allowed",
        message: initialError,
        autoClose: 3000,
      });
    }
    claimPerk(perk.id);
  }

  const [loadingClaim, setLoadingClaim] = useState(false);
  async function claimPerk(benefitId: number) {
    try {
      setLoadingClaim(true);
      const claim = await api
        .post(`/api/benefit/${benefitId}/claim`)
        .then((res) => res.data);
      if (claim) {
        console.log(claim);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        showNotification({
          title: "Congratulations 🎉",
          message: "you have to show the qr to the supplier to verify claim",
          autoClose: 5000,
        });
        router.push("/claim/" + claim.id);
      }
    } catch (err) {
      let error = err as any;
      if (error?.response?.data?.code === "E_NOT_ALLOWED") {
        showNotification({
          title: "Not allowed",
          message: error.response.data.message,
          autoClose: 5000,
        });
        return;
      }
      showNotification({
        title: "Please try again",
        message: "There was an error",
        autoClose: 5000,
      });
    } finally {
      setLoadingClaim(false);
    }
  }

  // TODO: get errors or validations from props, and disable claim or actions
  return (
    <>
      <Box
        sx={{
          width: "100%",
          position: "fixed",
          bottom: "48px",
          backgroundColor: isDark ? theme.colors.dark[7] : "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-1.5rem",
            left: "0px",
            width: "100%",
            height: "1.5rem",
            backgroundImage: `linear-gradient(transparent, ${
              isDark ? theme.colors.dark[7] : "white"
            })`,
          }}
        ></div>
        <Divider />
        <Group p="md" align="top" noWrap spacing="xs">
          <Text sx={{ flexGrow: 1 }}>{perk.name}</Text>
          <Button
            loading={loadingAcquireStatus || loadingClaim}
            onClick={onClickClaim}
          >
            Claim
          </Button>
          <ActionIcon
            variant="transparent"
            onClick={() => setOpenedActions(true)}
          >
            <DotsVertical />
          </ActionIcon>
        </Group>
      </Box>

      <Drawer
        opened={openedActions}
        onClose={() => setOpenedActions(false)}
        padding="md"
        title="Actions"
        position="bottom"
      >
        <Box>
          <AppPerkViewActionsSave perk={perk} user={user} />
          <NavLink
            label="Share"
            icon={<Upload size={16} />}
            onClick={clickShare}
          />
          <NavLink
            label="Copy url"
            icon={<LinkIcon size={16} />}
            onClick={clickCopyUrl}
          />
          <NavLink label="Report abuse" icon={<MessageReport size={16} />} />
        </Box>
      </Drawer>
    </>
  );
}

export default AppPerkViewActions;
