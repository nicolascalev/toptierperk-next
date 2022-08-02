import { SegmentedControl, Text } from "@mantine/core";
import { useState, useEffect } from "react";

type AquiredType = "all" | "acquired" | "notacquired";

function AppAquiredSelect(props: any) {
  const acquiredOptions = [
    { label: "All", value: "all" },
    { label: "Acquired", value: "acquired" },
    { label: "Not acquired", value: "notacquired" },
  ];
  const [selectedAcquired, setSelectedAcquired] = useState<AquiredType>("all");
  function getIsAquired(value: AquiredType) {
    if (value == "acquired") {
      return true;
    }
    if (value == "notacquired") {
      return false;
    }
    return undefined;
  }
  function onChange(val: AquiredType) {
    setSelectedAcquired(val);
    props.onChange(getIsAquired(val));
  }

  useEffect(() => {
    if (props.value === true) {
      setSelectedAcquired("acquired");
    }
    if (props.value === false) {
      setSelectedAcquired("notacquired");
    }
    if (props.value === undefined) {
      setSelectedAcquired("all");
    }
  }, [props]);

  return (
    <>
      <Text weight={500} size="sm" mb={1}>
        Acquired
      </Text>
      <SegmentedControl
        sx={{ width: "100%" }}
        value={selectedAcquired}
        onChange={onChange}
        data={acquiredOptions}
      />
    </>
  );
}

export default AppAquiredSelect;
