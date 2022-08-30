import { Button, ButtonProps, Tooltip } from "@mantine/core";
import api from "config/api";
import { useEffect } from "react";
import { useState } from "react";
import useSWR from "swr";
import { showNotification } from "@mantine/notifications";

type AcquireButtonProps = {
  perkId: number;
  businessId: number;
};
const fetcher = (url: string) => api.get(url).then((res) => res.data);
function AppAcquirePerkButton({
  perkId,
  businessId,
  ...props
}: AcquireButtonProps & ButtonProps) {
  const endpoint = `/api/business/${businessId}/benefits/${perkId}`;
  const { data, error } = useSWR(endpoint, fetcher);
  const [status, setStatus] = useState<{
    perkIsAvailable: boolean;
    perkIsAcquired: boolean;
  } | null>(null);

  const loadingStatus = !status && !error;

  const disabled = loadingStatus || !status?.perkIsAvailable;

  const [label, setLabel] = useState("Acquire");

  const [loading, setLoading] = useState(false);

  // TODO: show acquire notification
  async function acquireBenefit() {
    try {
      setLoading(true);
      await api.put(endpoint);
      setLabel("Loose");
      setStatus((status) => {
        if (!status) {
          return null;
        }
        return {
          ...status,
          perkIsAcquired: true,
        };
      });
      showNotification({
        title: "Perk acquired",
        message: "Now this perk is available to your employees.",
        color: "green",
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function looseBenefit() {
    try {
      setLoading(true);
      await api.delete(endpoint);
      setLabel("Acquire");
      setStatus((status) => {
        if (!status) {
          return null;
        }
        return {
          ...status,
          perkIsAcquired: false,
        };
      });
      showNotification({
        title: "Removed perk",
        message: "This perk is no longer available to your employees.",
        autoClose: 5000,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onClick() {
    if (!status) return;
    if (status.perkIsAcquired) {
      looseBenefit();
    } else {
      acquireBenefit();
    }
  }

  useEffect(() => {
    setStatus(data);
    if (data) {
      setLabel(data.perkIsAcquired ? "Loose" : "Acquire");
    }
  }, [data]);

  return (
    <Tooltip
      label="Perk not available"
      disabled={
        status && !status?.perkIsAcquired && !status?.perkIsAvailable
          ? true
          : false
      }
    >
      <Button
        disabled={disabled}
        loading={loadingStatus || loading}
        onClick={onClick}
        {...props}
      >
        {label}
      </Button>
    </Tooltip>
  );
}

export default AppAcquirePerkButton;
