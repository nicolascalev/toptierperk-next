import { Select, Text, Loader } from "@mantine/core";
import useSWR from "swr";
import api from "config/api";
import { useState, useEffect, useMemo } from "react";
import { useDebouncedValue } from "@mantine/hooks";

const fetcher = (url: string, params: any) =>
  api.get(url, { params }).then((res) => res.data);

type Props = {
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

function AppSelectBusiness(props: Props) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchString, setSearchString] = useState("");
  const [debSearchString] = useDebouncedValue(searchString, 500);
  const [cursor, setCursor] = useState<undefined | number>(undefined);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    setBusinesses([]);
    setCursor(undefined);
    setSkip(0);
    setSearchString("");
  }, []);

  const params = useMemo(() => {
    return {
      skip,
      cursor,
      searchString: debSearchString,
    };
  }, [skip, cursor, debSearchString]);

  const { data: businessesData, error: businessesLoadingError } = useSWR(
    ["/api/business", params],
    fetcher
  );
  const loadingBusinesses = !businessesData && !businessesLoadingError;

  useEffect(() => {
    if (businessesData) {
      setBusinesses(businessesData);
    }
  }, [businessesData]);

  const [selectBusinesses, setSelectBusinesses] = useState<any[]>([]);
  useEffect(() => {
    setSelectBusinesses(
      businesses.map((bus: any) => {
        return {
          value: bus.id,
          label: bus.name,
          group: "Showing up to 10 results",
        };
      })
    );
  }, [businesses]);

  function onChange(value: string | null) {
    setBusinessId(value);
    props.onChange(value ? Number(value) : null);
  }

  return (
    <Select
      label={
        <Text style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          Search Business {loadingBusinesses && <Loader size="xs" />}
        </Text>
      }
      placeholder="Business"
      description="You can scan the qr code or search business here"
      value={businessId}
      onChange={onChange}
      disabled={props.disabled}
      searchable
      clearable
      onInput={(e) => setSearchString(e.currentTarget.value)}
      nothingFound={!loadingBusinesses && "No results"}
      data={selectBusinesses}
    />
  );
}

export default AppSelectBusiness;
