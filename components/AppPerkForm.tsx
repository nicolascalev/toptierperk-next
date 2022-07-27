import { useState } from "react";
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
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm, joiResolver } from "@mantine/form";
import AppDropzone from "./AppDropzone";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Photo,
} from "tabler-icons-react";
import Joi from "joi";
import axios from "axios";

const createBenefitSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  isPrivate: Joi.boolean(),
  useLimit: Joi.number().integer().min(1).allow(null).optional(),
  useLimitPerUser: Joi.number().integer().min(1).allow(null).optional(),
  startsAt: Joi.date().allow(null).optional(),
  finishesAt: Joi.date().allow(null).optional(),
});

export default function AppPerkForm(props: any) {
  const theme = useMantineTheme();

  const form = useForm({
    validate: joiResolver(createBenefitSchema),
    initialValues: {
      name: "",
      description: "",
      useLimit: null,
      useLimitPerUser: null,
      startsAt: new Date(),
      finishesAt: null,
    },
  });

  const initialCategories: string[] = [];
  const [categories, setCategories] = useState(initialCategories);

  const [isPrivate, setIsPrivate] = useState("public");

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

  function beforeSubmit() {
    let validation = form.validate();
    if (validation.hasErrors) return;
    let data: any = { ...form.values };
    data.isPrivate = isPrivate === "private" ? true : false;
    data.categories = categories.join(",");
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
    const formData = beforeSubmit();
    if (!formData) return;
    await createPerk(formData);
  }

  async function saveDraft() {
    const formData = beforeSubmit();
    if (!formData) return;
    formData.append("isActive", "false");
    await createPerk(formData);
  }

  async function createPerk(formData: FormData) {
    try {
      setLoading(true);
      const { data: createdPerk } = await axios.post("/api/benefit", formData);
      console.log(createdPerk);
      // TODO: do something after create, maybe redirect to perk view
    } catch (err) {
      console.log((err as any).response.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
              <ActionIcon color="dark" variant="light" onClick={carouselRight}>
                <ChevronRight></ChevronRight>
              </ActionIcon>
            </Group>
          </>
        )}
      </div>
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
            placeholder="Select items"
            searchable
            creatable
            getCreateLabel={(query) => `+ Add ${query}`}
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

          <Group position="right">
            <Button variant="default" loading={loading} onClick={saveDraft}>
              Save for later
            </Button>
            <Button type="submit" loading={loading}>
              Create
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
            <AppDropzone onDrop={onDropFiles} />
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
