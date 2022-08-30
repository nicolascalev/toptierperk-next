import { useState, useEffect } from "react";
import {
  Text,
  Button,
  Drawer,
  Select,
  Box,
  Group,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { Edit, Search, X } from "tabler-icons-react";
import { debounce } from "lodash";
import api from "config/api";

const debouncedSearchBusiness = debounce(
  async (setBusinessesSearchItems, availableFor, name) => {
    try {
      const { data } = await api.get("/api/business", {
        params: { take: 15, searchString: name },
      });
      const parsedItems = data.map((business: any) => {
        const itemOnList = availableFor.find(
          (com: any) => com.id === business.id
        );
        return {
          value: `${business.id}`,
          label: business.name,
          disabled: itemOnList ? true : false,
          group: itemOnList ? "Business already on list" : "Add",
          business,
        };
      });
      setBusinessesSearchItems(parsedItems);
    } catch (err) {
      setBusinessesSearchItems([]);
      console.log(err);
    }
  },
  500
);

function AppAvailableForInput(props: any) {
  if (!props.onChange) {
    throw new Error("'onChange' param is a must");
  }
  const [availableFor, setAvailableFor] = useState(props.availableFor || []);
  useEffect(() => {
    setAvailableFor(props.availableFor)
  }, [props.availableFor])
  const [openedDrawer, setOpenedDrawer] = useState(false);
  function onCloseDrawer() {
    props.onChange(availableFor);
    setOpenedDrawer(false);
  }

  const [businessesSearchItems, setBusinessesSearchItems] = useState<any>([]);
  function setLoadingSearch() {
    setBusinessesSearchItems([
      { value: "loading", label: "Loading...", disabled: true },
    ]);
  }
  const [selectValue, setSelectValue] = useState("");
  function onSelectChange(val: any) {
    setSelectValue(val);
    if (!val) return;
    const selectedBusiness = businessesSearchItems.find(
      (item: any) => item.value === val
    ).business;
    setAvailableFor([...availableFor, ...[selectedBusiness]]);
  }

  function removeBusinessItem(businessIndex: number) {
    const copy = [...availableFor];
    copy.splice(businessIndex, 1);
    setAvailableFor(copy);
  }

  const [searchString, setSearchString] = useState("");
  useEffect(() => {
    if (searchString) {
      setLoadingSearch();
      debouncedSearchBusiness(
        setBusinessesSearchItems,
        availableFor,
        searchString
      );
    }
  }, [searchString, availableFor]);

  return (
    <div>
      <Text weight={500} size="sm">
        Available for
      </Text>
      <Text size="xs" color="dimmed">
        List of businesses allowed to acquire this exclusive perk
      </Text>
      <Button
        variant="default"
        sx={{ width: "100%", marginTop: 2 }}
        rightIcon={<Edit />}
        onClick={() => setOpenedDrawer(true)}
        loading={props.loading}
        disabled={props.loading}
      >
        {availableFor.length} Selected
      </Button>
      <Drawer
        opened={openedDrawer}
        onClose={onCloseDrawer}
        title="Update businesses"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Select
          placeholder="Business Name"
          data={businessesSearchItems}
          value={selectValue}
          onChange={(val: any) => onSelectChange(val)}
          searchable
          nothingFound="No options"
          maxDropdownHeight={250}
          clearable
          icon={<Search />}
          onSearchChange={setSearchString}
        />
        <Box mt="md">
          {availableFor.length === 0 && (
            <Text color="dimmed" size="sm">
              This perk is not available to any businesses when private yet
            </Text>
          )}
          {availableFor.length > 0 && (
            <Text color="dimmed" size="sm">
              Available for {availableFor.length} businesses
            </Text>
          )}
          {availableFor.map((business: any, index: number) => (
            <div key={business.id}>
              {index !== 0 && <Divider></Divider>}
              <Group position="apart" spacing="xs" py="md">
                <Text>{business.name}</Text>
                <ActionIcon size="xs">
                  <X onClick={() => removeBusinessItem(index)} />
                </ActionIcon>
              </Group>
            </div>
          ))}
        </Box>
      </Drawer>
    </div>
  );
}

export default AppAvailableForInput;
