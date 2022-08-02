import { Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string, searchString: string) =>
  axios.get(url, {
    params: {
      searchString,
    },
  });

function AppCategorySelect(props: any) {
  const [searchString, setSearchString] = useState("");
  const [debSearchString] = useDebouncedValue(searchString, 500);
  const { data, error }: any = useSWR(
    debSearchString ? ["/api/category", debSearchString] : null,
    fetcher
  );
  let emptyListMessage =
    !data && !error ? "Loading..." : "No results with that category";
  emptyListMessage = !debSearchString ? "Search by name" : emptyListMessage;
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setCategories(
        data.data.map((cat: any) => ({
          label: cat.name,
          value: `${cat.id}`,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    props.onChange(category || undefined);
  }, [category, props]);

  return (
    <Select
      label="Category"
      placeholder="Select category"
      nothingFound={emptyListMessage}
      searchable
      clearable
      data={categories}
      value={category}
      onInput={(val: any) => setSearchString(val.currentTarget.value)}
      onChange={(val: string) => setCategory(val)}
    />
  );
}

export default AppCategorySelect;
