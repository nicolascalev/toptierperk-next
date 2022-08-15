import { useState, useRef, useEffect } from "react";
import {
  ActionIcon,
  Group,
  Stack,
  TextInput,
  Button,
  Box,
  Text,
  Image,
} from "@mantine/core";
import { Upload } from "tabler-icons-react";
import { useForm, joiResolver } from "@mantine/form";
import Joi from "joi";
import { isEmpty } from "lodash";
import axios from "axios";
import { showNotification } from "@mantine/notifications";
import { useDebouncedValue } from "@mantine/hooks";

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

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(40).required(),
  username: Joi.string()
    .lowercase()
    .regex(/^[a-z0-9_.]+$/)
    .min(2)
    .max(40)
    .required(),
  email: Joi.string(),
});

interface Props {
  user: any;
}

function AppUserForm({ user }: Props) {
  const form = useForm({
    validate: joiResolver(updateUserSchema),
    initialValues: {
      name: user.name,
      email: user.email,
      username: user.username,
    },
    validateInputOnChange: true,
  });

  const [username, setUsername] = useState("");
  const [debUsername] = useDebouncedValue(username, 500);
  const [usernameError, setUsernameError] = useState("");
  useEffect(() => {
    if (usernameError == "That username has been taken already") {
      form.setFieldError("username", usernameError);
    }
    if (!form.errors.username && usernameError == "") {
      form.clearFieldError("username");
    }
  }, [usernameError, form]);
  useEffect(() => {
    setUsernameError("");
    async function fetchData() {
      try {
        const data = await axios
          .get("/api/user", {
            params: {
              username: debUsername,
            },
          })
          .then((res) => res.data);
        if (data) {
          setUsernameError("That username has been taken already");
        }
      } catch (err) {
        showNotification({
          title: "Could not verify availability",
          color: "red",
          message: "Please try again",
        });
      }
    }
    if (!form.errors.username && debUsername && debUsername !== user.username) {
      fetchData();
    }
  }, [debUsername, form.errors.username, user.username]);

  const { fileInput, changeUploadFile, logo, parsedLogo, clickUploadfile } =
    useFileUpload();

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value as string);
    }
    if (logo) {
      formData.set("picture", logo as Blob);
    }
    updateProfile(formData);
  };

  const [loading, setLoading] = useState(false);
  async function updateProfile(formData: FormData) {
    try {
      setLoading(true);
      const updated = await axios.patch("/api/user/" + user.id, formData);
      showNotification({
        title: "Profile updated",
        message: "Page will refresh in 3 seconds",
      });
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 3000);
      form.setErrors({ dirty: 'Set error to disable submit before page refresh'});
    } catch (err) {
      showNotification({
        title: "Please try again",
        color: "red",
        message: "Update profile attempt failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Box>
          <Text size="sm" weight={500} mb={3}>
            Profile picture
          </Text>
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(e) => changeUploadFile(e)}
          />
          <div
            style={{ position: "relative", width: "64px" }}
            onClick={clickUploadfile}
          >
            <ActionIcon
              size="xs"
              variant="filled"
              color="brand"
              radius="xl"
              p={2}
              sx={{
                position: "absolute",
                right: "0px",
                top: "0px",
                zIndex: 10,
              }}
            >
              <Upload />
            </ActionIcon>
            <Image
              src={
                parsedLogo ||
                user.picture?.url ||
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              }
              alt="Business Logo"
              width={64}
              height={64}
              radius={100}
            ></Image>
          </div>
        </Box>
        <TextInput
          placeholder="Your name"
          label="Full name"
          description="Type your full name, for example John Doe"
          required
          {...form.getInputProps("name")}
        />
        <TextInput
          placeholder="Username"
          label="Username"
          description="You can change your username"
          required
          onInput={(e: any) => setUsername(e.target.value)}
          {...form.getInputProps("username")}
        />
        <TextInput
          placeholder="Email"
          label="email"
          disabled
          required
          {...form.getInputProps("email")}
        />
        <Group position="right">
          <Button
            type="submit"
            disabled={!isEmpty(form.errors)}
            loading={loading}
          >
            Update profile
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default AppUserForm;
