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
import axios from "axios";

const debouncedSearchCompany = debounce(
  async (setCompaniesSearchItems, startLoader, name) => {
    try {
      startLoader();
      const { data } = await axios.get("/api/company", {
        params: { take: 15, searchString: name },
      });
      const parsedItems = data.map((company: any) => ({
        value: company.id,
        label: company.name,
      }));
      setCompaniesSearchItems(parsedItems);
    } catch (err) {
      setCompaniesSearchItems([]);
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
  const [openedDrawer, setOpenedDrawer] = useState(false);
  function onCloseDrawer() {
    props.onChange(availableFor);
    setOpenedDrawer(false);
  }

  const [searchString, setSearchString] = useState("")
  const [companiesSearchItems, setCompaniesSearchItems] = useState<any>([]);
  function setLoadingSearch() {
    setCompaniesSearchItems([
      { value: "loading", label: "Loading...", disabled: true },
    ]);
  }

  useEffect(() => {
    if (searchString) {
      debouncedSearchCompany(setCompaniesSearchItems, setLoadingSearch, searchString)
    }
  }, [searchString])

  return (
    <div>
      <Text weight={500} size="sm">
        Available for
      </Text>
      <Text size="xs" color="dimmed">
        List of companies allowed to acquire this exclusive perk
      </Text>
      <Button
        variant="default"
        sx={{ width: "100%", marginTop: 2 }}
        rightIcon={<Edit />}
        onClick={() => setOpenedDrawer(true)}
      >
        {availableFor.length} Selected
      </Button>
      <Drawer
        opened={openedDrawer}
        onClose={onCloseDrawer}
        title="Update companies"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Select
          label="Search"
          placeholder="Company Name"
          searchable
          nothingFound="No options"
          data={companiesSearchItems}
          maxDropdownHeight={250}
          icon={<Search />}
          onSearchChange={setSearchString}
        />
        <Box mt="md">
          {availableFor.length === 0 && (
            <Text color="dimmed">
              This perk is not available to any companies when private yet
            </Text>
          )}
          {availableFor.map((company: any, index: number) => (
            <div key={company.id}>
              {index !== 0 && <Divider></Divider>}
              <Group position="apart" spacing="xs" py="md">
                <Text>{company.name}</Text>
                <ActionIcon size="xs">
                  <X />
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
