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
import axios from "axios";
import Joi from "joi";

const createCompanySchema = Joi.object({
  name: Joi.string().required().max(30),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
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
const debounceFindBusiness = debounce(async (name, form) => {
  if (!name || !form) return;
  if (name.length > 30) return;
  const { data } = await axios.get("/api/business/findByName", {
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
  action: "create";
  initialvalues?: any;
  onSuccess: () => void;
  onError: (error: any) => void;
};

function AppBusinessForm({
  action,
  initialvalues,
  onSuccess,
  onError,
}: PropTypes) {
  const theme = useMantineTheme();

  // TODO: add extra validations
  const form = useForm({
    validate: joiResolver(createCompanySchema),
    initialValues: initialvalues || {
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
  };

  const [loading, setLoading] = useState(false);
  async function submitBusiness(formData: FormData) {
    setLoading(true);
    try {
      await axios.post("/api/business", formData);
      onSuccess();
    } catch (err: any) {
      if (err.response?.data?.error?.code == "P2002") {
        form.setFieldError("email", "A business has been registered with that account before");
        onError(err.response?.data);
      }
    } finally {
      setLoading(false);
    }
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
          {logo ? (
            <Image
              onClick={clickUploadfile}
              src={parsedLogo}
              alt="Business Logo"
              width={128}
              height={128}
              radius={150}
            ></Image>
          ) : (
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
          placeholder=""
          onInput={(e: any) => debounceFindBusiness(e.target.value, form)}
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
        {/* TODO: add actual terms and conditions */}
        <Checkbox required label="I agree to Terms and Conditions" />
        <Group position="right">
          <Button
            type="submit"
            disabled={!isEmpty(form.errors)}
            loading={loading}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default AppBusinessForm;
