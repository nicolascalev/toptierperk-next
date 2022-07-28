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
  async (setCompaniesSearchItems, availableFor, name) => {
    try {
      const { data } = await axios.get("/api/company", {
        params: { take: 15, searchString: name },
      });
      const parsedItems = data.map((company: any) => {
        const itemOnList = availableFor.find(
          (com: any) => com.id === company.id
        );
        return {
          value: `${company.id}`,
          label: company.name,
          disabled: itemOnList ? true : false,
          group: itemOnList ? "Company already on list" : "Add",
          company,
        };
      });
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
  useEffect(() => {
    setAvailableFor(props.availableFor)
  }, [props.availableFor])
  const [openedDrawer, setOpenedDrawer] = useState(false);
  function onCloseDrawer() {
    props.onChange(availableFor);
    setOpenedDrawer(false);
  }

  const [companiesSearchItems, setCompaniesSearchItems] = useState<any>([]);
  function setLoadingSearch() {
    setCompaniesSearchItems([
      { value: "loading", label: "Loading...", disabled: true },
    ]);
  }
  const [selectValue, setSelectValue] = useState("");
  function onSelectChange(val: any) {
    setSelectValue(val);
    if (!val) return;
    const selectedCompany = companiesSearchItems.find(
      (item: any) => item.value === val
    ).company;
    setAvailableFor([...availableFor, ...[selectedCompany]]);
  }

  function removeCompanyItem(companyIndex: number) {
    const copy = [...availableFor];
    copy.splice(companyIndex, 1);
    setAvailableFor(copy);
  }

  const [searchString, setSearchString] = useState("");
  useEffect(() => {
    if (searchString) {
      setLoadingSearch();
      debouncedSearchCompany(
        setCompaniesSearchItems,
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
        List of companies allowed to acquire this exclusive perk
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
        title="Update companies"
        padding="md"
        size="xl"
        position="bottom"
      >
        <Select
          placeholder="Company Name"
          data={companiesSearchItems}
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
              This perk is not available to any companies when private yet
            </Text>
          )}
          {availableFor.length > 0 && (
            <Text color="dimmed" size="sm">
              Available for {availableFor.length} companies
            </Text>
          )}
          {availableFor.map((company: any, index: number) => (
            <div key={company.id}>
              {index !== 0 && <Divider></Divider>}
              <Group position="apart" spacing="xs" py="md">
                <Text>{company.name}</Text>
                <ActionIcon size="xs">
                  <X onClick={() => removeCompanyItem(index)} />
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
