import { Button, ButtonProps, Tooltip } from "@mantine/core";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import useSWR from "swr";

type AcquireButtonProps = {
  perkId: number;
  companyId: number;
};
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
function AppAcquirePerkButton({
  perkId,
  companyId,
  ...props
}: AcquireButtonProps & ButtonProps) {
  const endpoint = `/api/company/${companyId}/benefits/${perkId}`;
  const { data, error } = useSWR(
    endpoint,
    fetcher
  );
  const [status, setStatus] = useState<{ perkIsAvailable: boolean; perkIsAcquired: boolean } | null>(null);

  const loadingStatus = !status && !error;

  const disabled = loadingStatus || !status?.perkIsAvailable;

  const [label, setLabel] = useState("Acquire");

  const [loading, setLoading] = useState(false);

  // TODO: show acquire notification
  async function acquireBenefit() {
    try {
      setLoading(true);
      await axios.put(endpoint);
      setLabel("Loose");
      setStatus(status => {
        if (!status) {
          return null
        }
        return {
          ...status,
          perkIsAcquired: true,
        }
      })
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function looseBenefit() {
    try {
      setLoading(true);
      await axios.delete(endpoint);
      setLabel("Acquire");
      setStatus(status => {
        if (!status) {
          return null
        }
        return {
          ...status,
          perkIsAcquired: false,
        }
      })
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function onClick() {
    if (!status) return
    if (status.perkIsAcquired) {
      console.log('made it there')
      looseBenefit();
    } else {
      acquireBenefit();
    }
  }
  
  useEffect(() => {
    setStatus(data);
    if (data) {
      setLabel(data.perkIsAcquired ? "Loose" : "Acquire")
    }
  }, [data])

  return (
    <Tooltip
      label="Perk not available"
      disabled={(status && !status?.perkIsAcquired && !status?.perkIsAvailable) ? true : false}
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
