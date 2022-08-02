import { SegmentedControl, Text } from "@mantine/core";
import { useState, useEffect } from "react";

type PrivacyType = "all" | "private" | "public";

function AppPrivacySelect(props: any) {
  const privacyOptions = [
    { label: "All", value: "all" },
    { label: "Private", value: "private" },
    { label: "Public", value: "public" },
  ];
  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacyType>("all");
  function getIsPrivate(value: PrivacyType) {
    if (value == "private") {
      return true;
    }
    if (value == "public") {
      return false;
    }
    return undefined;
  }
  function onChange(val: PrivacyType) {
    setSelectedPrivacy(val);
    props.onChange(getIsPrivate(val));
  }

  useEffect(() => {
    if (props.value === true) {
      setSelectedPrivacy("private");
    }
    if (props.value === false) {
      setSelectedPrivacy("public");
    }
    if (props.value === undefined) {
      setSelectedPrivacy("all");
    }
  }, [props]);

  return (
    <>
      <Text weight={500} size="sm" mb={1}>
        Privacy
      </Text>
      <SegmentedControl
        sx={{ width: "100%" }}
        value={selectedPrivacy}
        onChange={onChange}
        data={privacyOptions}
      />
    </>
  );
}

export default AppPrivacySelect;
