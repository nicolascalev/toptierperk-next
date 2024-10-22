import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useMantineTheme,
  Stack,
  NumberInput,
  TextInput,
  Textarea,
  Button,
  Group,
  MultiSelect,
  SegmentedControl,
  AspectRatio,
  Image,
  ActionIcon,
  Drawer,
  ScrollArea,
  SimpleGrid,
  Text,
  Paper,
  Badge,
  Radio,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm, joiResolver } from "@mantine/form";
import AppDropzone from "./AppDropzone";
import { ChevronLeft, ChevronRight, Photo } from "tabler-icons-react";
import Joi from "joi";
import api from "config/api";
import AppAvailableForInput from "./AppAvailableForInput";
import { showNotification } from "@mantine/notifications";

const createBenefitSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  isPrivate: Joi.boolean(),
  useLimit: Joi.number().integer().min(1).allow(null).optional(),
  useLimitPerUser: Joi.number().integer().min(1).allow(null).optional(),
  startsAt: Joi.date().allow(null).optional(),
  finishesAt: Joi.date().allow(null).optional(),
});

function useFetchAvailableFor(action: string) {
  const router = useRouter();
  const perkId = router.query.id;
  const [loadingAvailableFor, setLoadingAvailableFor] = useState(false);
  const [availableFor, setAvailableFor] = useState([]);
  const [loadAvailableForError, setLoadAvailableForError] = useState<any>(null);
  useEffect(() => {
    async function loadAvailableFor() {
      setLoadingAvailableFor(true);
      setLoadAvailableForError(null);
      try {
        const { data } = await api.get(`/api/benefit/${perkId}/availableFor`);
        setAvailableFor(data);
      } catch (err) {
        setLoadAvailableForError((err as any).response);
      } finally {
        setLoadingAvailableFor(false);
      }
    }
    if (action === "update") {
      loadAvailableFor();
    }
  }, [perkId, action]);
  return {
    loadingAvailableFor,
    availableFor,
    setAvailableFor,
    loadAvailableForError,
  };
}

export default function AppPerkForm(props: any) {
  const theme = useMantineTheme();
  const router = useRouter();

  if (!props.action || !["create", "update"].includes(props.action)) {
    throw new Error(
      "action prop is mandatory and should be 'create' or 'update'"
    );
  }

  if (props.action === "update" && !props.perk) {
    throw new Error("if the action is 'update' then perk prop is a must");
  }

  const perk = props.perk;

  const form = useForm({
    validate: joiResolver(createBenefitSchema),
    initialValues: {
      name: perk ? perk.name : "",
      description: perk ? perk.description : "",
      useLimit: perk ? perk.useLimit : null,
      useLimitPerUser: perk ? perk.useLimitPerUser : null,
      startsAt: getInitialDateValue(perk, "startsAt", new Date()),
      finishesAt: getInitialDateValue(perk, "finishesAt", null),
    },
  });

  function getInitialDateValue(
    perk: any,
    attr: string,
    defaultValue: Date | null
  ) {
    if (!perk) {
      return defaultValue;
    }
    if (perk[attr]) {
      return new Date(perk[attr]);
    }
    return defaultValue;
  }

  const initialCategories: string[] = perk?.categories
    ? perk.categories.map((cat: any) => cat.name)
    : [];
  const [categories, setCategories] = useState(initialCategories);
  const [categoryLengthError, setCategoryLengthError] = useState("");

  const privacy = props.perk?.isPrivate ? "private" : "public";
  const [isPrivate, setIsPrivate] = useState(privacy);

  const perkIsActive = props.perk?.isActive ? "true" : "false";
  const [isActive, setIsActive] = useState(perkIsActive);

  const {
    loadingAvailableFor,
    availableFor,
    setAvailableFor,
    loadAvailableForError,
  } = useFetchAvailableFor(props.action);

  const [openedImageUploader, setOpenedImageUploader] = useState(false);
  function openImageUploader(e: any) {
    e.stopPropagation();
    setOpenedImageUploader(true);
  }
  const [photos, setPhotos] = useState<any[]>([]);
  async function onDropFiles(files: any) {
    for (const file of files) {
      file.dataURL = await readFileAsDataURL(file);
    }
    setPhotos([...photos, ...files]);
  }

  async function readFileAsDataURL(file: any) {
    let result_base64 = await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });

    return result_base64;
  }

  const [displayPhoto, setDisplayPhoto] = useState(0);
  function carouselLeft() {
    if (displayPhoto == 0) {
      return;
    }
    setDisplayPhoto(displayPhoto - 1);
  }
  function carouselRight() {
    if (displayPhoto == photos.length - 1) {
      return;
    }
    setDisplayPhoto(displayPhoto + 1);
  }

  function parseFormData() {
    let validation = form.validate();
    if (validation.hasErrors) return;
    let data: any = { ...form.values };
    data.isPrivate = isPrivate === "private" ? true : false;
    data.categories = categories.join(",");
    data.availableFor = availableFor.map((com: any) => com.id).join(",");
    let formData = new FormData();
    for (const [key, val] of Object.entries(data)) {
      if (!val) continue;
      formData.append(key, val as any);
    }
    for (const photo of photos) {
      formData.append("photos", photo, photo.name);
    }
    return formData;
  }

  const [loading, setLoading] = useState(false);
  async function onSubmit(e: any) {
    e.preventDefault();
    const formData = parseFormData();
    if (!formData) return;
    if (props.action === "create") {
      if (photos.length === 0) {
        showNotification({
          title: "One more thing",
          message: "You need to upload at least one photo.",
          color: "red",
          autoClose: 5000,
        });
        return;
      }
      await createPerk(formData);
    }
    if (props.action === "update") {
      formData.append("isActive", isActive);
      await updatePerk(formData);
    }
  }

  async function saveDraft() {
    const formData = parseFormData();
    if (!formData) return;
    formData.append("isActive", "false");
    await createPerk(formData);
  }

  async function createPerk(formData: FormData) {
    try {
      setLoading(true);
      const { data: createdPerk } = await api.post("/api/benefit", formData);
      router.push("/perk/" + createdPerk.id);
      showNotification({
        title: "Created",
        message: "Perk created, and available to your employees.",
        color: "green",
        autoClose: 5000,
      });
    } catch (err) {
      // TODO: do something with the error on both requests
      showNotification({
        title: "Please try again",
        message: "let us know if the error persists",
        color: "red",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function updatePerk(formData: FormData) {
    try {
      setLoading(true);
      const { data: updatedPerk } = await api.patch(
        "/api/benefit/" + perk.id,
        formData
      );
      router.push("/perk/" + updatedPerk.id);
      showNotification({
        title: "Perk updated",
        message: "This perk was successfully updated",
        color: "green",
        autoClose: 5000,
      });
    } catch (err) {
      showNotification({
        title: "Please try again",
        message: "let us know if the error persists",
        color: "red",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  function onReject(files: any) {
    showNotification({
      title: "Some photos are too large",
      message: `${files.length} files were bigger than 3mb`,
      color: "red",
      autoClose: 5000,
    });
  }

  return (
    <>
      {props.action === "create" && (
        <div style={{ width: "100%", position: "relative" }}>
          <AspectRatio ratio={16 / 9} sx={{ width: "100%" }}>
            {photos.length > 0 ? (
              <Image
                src={photos[displayPhoto].dataURL}
                alt="Perk Image"
                onClick={openImageUploader}
              />
            ) : (
              <Paper
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                })}
                onClick={openImageUploader}
              >
                <ActionIcon>
                  <Photo />
                </ActionIcon>
                Upload your photos
              </Paper>
            )}
          </AspectRatio>
          {photos.length > 0 && (
            <>
              <Badge
                color="gray"
                style={{
                  position: "absolute",
                  bottom: theme.spacing.md,
                  left: theme.spacing.md,
                }}
              >
                {displayPhoto + 1} / {photos.length}
              </Badge>
              <Group
                position="right"
                spacing="xs"
                style={{
                  position: "absolute",
                  bottom: theme.spacing.md,
                  right: theme.spacing.md,
                }}
              >
                <ActionIcon color="dark" variant="light" onClick={carouselLeft}>
                  <ChevronLeft></ChevronLeft>
                </ActionIcon>
                <ActionIcon
                  color="dark"
                  variant="light"
                  onClick={carouselRight}
                >
                  <ChevronRight></ChevronRight>
                </ActionIcon>
              </Group>
            </>
          )}
        </div>
      )}
      <form onSubmit={onSubmit} style={{ padding: theme.spacing.md }}>
        <Stack>
          <SegmentedControl
            fullWidth
            value={isPrivate}
            onChange={setIsPrivate}
            data={[
              { label: "Public", value: "public" },
              { label: "Private", value: "private" },
            ]}
          />
          {props.action === "update" && isPrivate === "private" && (
            <Text size="sm" color="dimmed">
              Perk will be private but the businesses that got it while it was
              public will keep it.
            </Text>
          )}
          <TextInput
            required
            label="Name"
            placeholder=""
            {...form.getInputProps("name")}
          />
          <Textarea
            required
            label="Description"
            placeholder="Type your description..."
            autosize
            minRows={2}
            {...form.getInputProps("description")}
          />
          <DatePicker
            label="Available On"
            description="If not specified, it defaults to now."
            placeholder="Pick start date"
            defaultValue={new Date()}
            minDate={new Date()}
            {...form.getInputProps("startsAt")}
          />
          <DatePicker
            label="Available By"
            description="If not specified, there is no date limit."
            placeholder="Pick end date"
            minDate={form.values.startsAt}
            {...form.getInputProps("finishesAt")}
          />
          <MultiSelect
            label="Select Categories"
            data={categories}
            value={categories}
            onChange={setCategories}
            placeholder="Select items"
            searchable
            creatable
            maxSelectedValues={10}
            getCreateLabel={(query) => `+ Add ${query}`}
            shouldCreate={(query) => {
              if (query.length > 0 && query.length <= 20) {
                setCategoryLengthError("");
                return true;
              }
              if (query.length == 0) {
                setCategoryLengthError("");
                return false;
              }
              setCategoryLengthError("Must be up to 20 characters.");
              return false;
            }}
            error={categoryLengthError || undefined}
            onCreate={(query) => {
              const item = { value: query, label: query };
              setCategories((current) => [...current, query]);
              return item;
            }}
          />
          <NumberInput
            label="Use Limit"
            placeholder="Amount of times this perk can be used"
            description="If not specified, there is no use limit"
            min={1}
            {...form.getInputProps("useLimit")}
          />
          <NumberInput
            label="Use Limit per User"
            placeholder="Limit times the same user can claim this."
            description="If not specified, there is no use limit"
            min={1}
            {...form.getInputProps("useLimitPerUser")}
          />
          {isPrivate === "private" && (
            <AppAvailableForInput
              availableFor={availableFor}
              loading={loadingAvailableFor}
              onChange={(updated: any) => setAvailableFor(updated)}
            />
          )}
          {props.action === "update" && (
            <Radio.Group
              label="Perk active state"
              description="Use this to disable your perk"
              value={isActive}
              onChange={setIsActive}
              required
            >
              <Radio value="true" label="Active" />
              <Radio value="false" label="Inactive (draft)" />
            </Radio.Group>
          )}

          <Group position="right">
            {props.action === "create" && (
              <Button variant="default" loading={loading} onClick={saveDraft}>
                Save for later
              </Button>
            )}
            <Button type="submit" loading={loading}>
              {props.action === "create" ? "Create" : "Update"}
            </Button>
          </Group>
        </Stack>
      </form>
      <Drawer
        opened={openedImageUploader}
        onClose={() => setOpenedImageUploader(false)}
        position="bottom"
        title="Photos"
        size="xl"
        styles={{
          header: { padding: theme.spacing.md, marginBottom: 0 },
        }}
      >
        <ScrollArea type="auto" style={{ height: "440px" }}>
          <div style={{ padding: theme.spacing.md, paddingTop: 0 }}>
            <AppDropzone onDrop={onDropFiles} onReject={onReject} />
            <Text
              color="dimmed"
              size="sm"
              style={{ marginTop: theme.spacing.sm }}
            >
              {photos.length} photos
            </Text>
          </div>
          <SimpleGrid cols={3} spacing={1}>
            {photos.map((photo, index) => (
              <AspectRatio
                key={index}
                ratio={1 / 1}
                style={{ width: "100%", display: "block" }}
              >
                <Image src={photo.dataURL} alt="Uploaded Image" />
              </AspectRatio>
            ))}
          </SimpleGrid>
        </ScrollArea>
      </Drawer>
    </>
  );
}
