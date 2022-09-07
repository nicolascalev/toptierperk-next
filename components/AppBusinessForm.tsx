import { useState, useRef } from "react";
import {
  useMantineTheme,
  Stack,
  TextInput,
  Textarea,
  Group,
  Button,
  Center,
  Image,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { useForm, joiResolver } from "@mantine/form";
import { Photo } from "tabler-icons-react";
import { debounce, isEmpty } from "lodash";
import api from "config/api";
import Joi from "joi";

const createBusinessSchema = Joi.object({
  name: Joi.string().required().max(30),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  about: Joi.string().required().max(500),
});

function useFileUpload() {
  const [logo, setLogo] = useState(null);
  const [parsedLogo, setParsedLogo] = useState<string | undefined>(undefined);
  const fileInput: React.RefObject<HTMLInputElement> = useRef(null);
  function clickUploadfile() {
    if (fileInput.current) {
      fileInput.current.click();
    }
  }
  function changeUploadFile(e: any) {
    setLogo(e.target.files[0]);
    if (e.target.files[0]) {
      readFileAsDataURL(e.target.files[0]);
    } else {
      setParsedLogo(undefined);
    }
  }

  function readFileAsDataURL(file: any) {
    var fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      if (e.target) {
        setParsedLogo(e.target.result);
      }
    };
    fileReader.readAsDataURL(file);
  }

  return { fileInput, changeUploadFile, logo, parsedLogo, clickUploadfile };
}

// Declare function outside of component so that its not redefined on update
const debounceFindBusiness = debounce(async (name, form, initialvalues) => {
  if (!name || !form) return;
  if (name.length > 30) return;
  if (name === initialvalues?.name) return;
  const { data } = await api.get("/api/business/findByName", {
    params: {
      searchString: name,
    },
  });
  if (data) {
    form.setFieldError("name", "Name has already been taken");
  } else {
    form.clearErrors();
  }
}, 300);

type PropTypes = {
  action: "create" | "update";
  businessId?: number;
  initialvalues?: any;
  disableTermsAndConditions?: boolean;
  onSuccess: () => void;
  onError: (error: any) => void;
};

function AppBusinessForm({
  action,
  businessId,
  initialvalues,
  disableTermsAndConditions,
  onSuccess,
  onError,
}: PropTypes) {
  const theme = useMantineTheme();

  const parsedInitialValues = initialvalues ? {
    name: initialvalues.name,
    email: initialvalues.email,
    about: initialvalues.about,
  } : undefined;

  const form = useForm({
    validate: joiResolver(createBusinessSchema),
    initialValues: {...parsedInitialValues} || {
      name: "",
      about: "",
      email: "",
    },
    validateInputOnChange: true,
  });

  const { fileInput, changeUploadFile, logo, parsedLogo, clickUploadfile } =
    useFileUpload();

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value as string);
    }
    if (logo) {
      formData.set("logo", logo as Blob);
    }
    if (action == "create") {
      submitBusiness(formData);
    }
    if (action == "update") {
      updateBusiness(formData);
    }
  };

  const [loading, setLoading] = useState(false);
  async function submitBusiness(formData: FormData) {
    setLoading(true);
    try {
      await api.post("/api/business", formData);
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.error?.code == "P2002") {
        form.setFieldError(
          "email",
          "A business has been registered with that account before"
        );
        onError(err.response?.data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateBusiness(formData: FormData) {
    if (!businessId) {
      throw new Error(
        "businessId must be provided if you want to update business"
      );
    }
    setLoading(true);
    try {
      await api.patch("/api/business/" + businessId, formData);
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.error?.code == "P2002") {
        form.setFieldError(
          "email",
          "A business has been registered with that account before"
        );
        onError(err.response?.data);
        return;
      }
      onError(err);
    } finally {
      setLoading(false);
    }
  }

  function disableSubmit(): boolean {
    if (
      action === "update" &&
      form.values.name === initialvalues.name &&
      form.values.email === initialvalues.email &&
      form.values.about === initialvalues.about &&
      !logo
    ) {
      return true;
    }
    return false;
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Center>
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(e) => changeUploadFile(e)}
          />
          {logo !== null && (
            <Image
              onClick={clickUploadfile}
              src={parsedLogo}
              alt="Business Logo"
              width={128}
              height={128}
              radius={150}
            ></Image>
          )}
          {!logo && initialvalues?.logo?.url && (
            <Image
              onClick={clickUploadfile}
              src={initialvalues.logo.url}
              alt="Business Logo"
              width={128}
              height={128}
              radius={150}
            ></Image>
          )}
          {!logo && !initialvalues?.logo?.url && (
            <Center
              onClick={clickUploadfile}
              style={{
                width: 128,
                height: 128,
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
                borderRadius: "150px",
              }}
            >
              <ActionIcon size="xl">
                <Photo size="xl"></Photo>
              </ActionIcon>
            </Center>
          )}
        </Center>
        <TextInput
          required
          label="Name"
          placeholder="Name"
          onInput={(e: any) =>
            debounceFindBusiness(e.target.value, form, initialvalues)
          }
          {...form.getInputProps("name")}
        />
        <TextInput
          placeholder="user@example.com"
          label="Email"
          required
          {...form.getInputProps("email")}
        />
        <Textarea
          required
          label="About"
          placeholder="Type your description..."
          autosize
          minRows={2}
          {...form.getInputProps("about")}
        />
        {!disableTermsAndConditions && (
          <>
            {/* TODO: add actual terms and conditions */}
            <Checkbox required label="I agree to Terms and Conditions" />
          </>
        )}
        <Group position="right">
          <Button
            type="submit"
            disabled={!isEmpty(form.errors) || disableSubmit()}
            loading={loading}
          >
            {action === "create" ? "Create" : "Update"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default AppBusinessForm;
