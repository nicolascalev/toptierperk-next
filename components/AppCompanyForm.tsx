import { useState, useRef, useEffect } from "react";
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
import { useForm } from "@mantine/form";
import { Photo } from "tabler-icons-react";
import { debounce } from "lodash"
import axios from "axios"

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
      setParsedLogo(undefined)
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
const debounceFindCompany = debounce(async (name, form) => {
  if (!name || !form) return
  const { data } = await axios.get("/api/company/findByName", {
    params: {
      searchString: name,
    }
  })
  if (data) {
    form.setFieldError("name", "Name has already been taken")
  } else {
    form.setFieldError("name", "")
  }
}, 300)

type PropTypes = {
  action: "create",
  initialvalues?: any,
  onSuccess: () => void,
  onError: (error: any) => void,
}

function AppCompanyForm({ action, initialvalues, onSuccess, onError }: PropTypes) {
  const theme = useMantineTheme();

  // TODO: add extra validations
  const form = useForm({
    initialValues: initialvalues || {
      name: "",
      about: "",
    },
  });

  const { fileInput, changeUploadFile, logo, parsedLogo, clickUploadfile } =
    useFileUpload();

  const handleSubmit = (values: any) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value as string)
    }
    if (logo) {
      formData.set("logo", logo as Blob)
    }
    if (action == "create") {
      submitCompany(formData)
    }
  }

  const [loading, setLoading] = useState(false)
  async function submitCompany(formData: FormData) {
    setLoading(true)
    try {
      await axios.post('/api/company', formData)
      onSuccess()
    } catch (err: any) {
      if (err.response?.data?.error?.code == "P2002") {
        form.setFieldError('name', 'Name has been taken');
        onError(err.response?.data)
      }
    } finally {
      setLoading(false)
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
              alt="Company Logo"
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
          onInput={(e: any) => debounceFindCompany(e.target.value, form)}
          {...form.getInputProps("name")}
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
          <Button type="submit" loading={loading}>Create</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default AppCompanyForm
