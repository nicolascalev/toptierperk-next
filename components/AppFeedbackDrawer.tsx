import {
  Drawer,
  SegmentedControl,
  DrawerProps,
  Center,
  Textarea,
  Button,
  Text,
  Select,
} from "@mantine/core";
import { useState, useEffect } from "react";
import {
  MoodSad,
  MoodConfuzed,
  MoodNeutral,
  MoodSmile,
  MoodHappy,
} from "tabler-icons-react";
import Joi from "joi";
import { useForm, joiResolver } from "@mantine/form";
import api from "config/api";
import { showNotification } from "@mantine/notifications";

const schema = Joi.object({
  feedback: Joi.string().min(35).max(1000).required(),
  type: Joi.string().required(),
});

type Props = {
  claimId?: number;
  perkId?: number;
  issueTypes?: string[];
  onFeedbackCreate: () => void;
} & DrawerProps;

function AppFeedbackDrawer({ claimId, perkId, onFeedbackCreate, ...rest }: Props) {
  const [mood, setMood] = useState("5");
  const [location, setLocation] = useState("");
  useEffect(() => {
    setLocation(window.location.href);
  }, []);

  // const [issueType, setIssueType] = useState<string | null>(null);
  const issueTypes = [
    ...(rest.issueTypes ? rest.issueTypes : []),
    ...[
      "I can not access specific content",
      "Page is frozen",
      "Nothing happens when I perform an action",
      "Things are loading too slow",
      "Something is not working as expected",
      "Other",
    ],
  ];

  const form = useForm({
    validate: joiResolver(schema),
    initialValues: {
      feedback: "",
      type: "",
    },
  });

  const [loadingCreateFeedback, setLoadingCreateFeedback] = useState(false);
  async function onSubmit(e: any) {
    e.preventDefault();
    const errors = form.validate();
    if (errors.hasErrors === true) return;
    const formData = {
      ...form.values,
      location,
      claim: claimId,
      benefit: perkId,
      mood: Number(mood),
    };
    try {
      setLoadingCreateFeedback(true);
      const created = await api
        .post("/api/feedback", formData)
        .then((res) => res.data);
      showNotification({
        title: "Thank you for letting us know",
        message: "Come back to see Toptierperk updates",
      });
      form.setFieldValue("feedback", "");
      onFeedbackCreate();
    } catch (err) {
      showNotification({
        title: "Please try again",
        message: "We could not process your request",
        color: "red",
      });
    } finally {
      setLoadingCreateFeedback(false);
    }
  }

  return (
    <Drawer title="Feedback" padding="md" {...rest}>
      <SegmentedControl
        color="brand"
        fullWidth
        value={mood}
        onChange={setMood}
        data={[
          {
            label: (
              <Center>
                <MoodSad />
              </Center>
            ),
            value: "1",
          },
          {
            label: (
              <Center>
                <MoodConfuzed />
              </Center>
            ),
            value: "2",
          },
          {
            label: (
              <Center>
                <MoodNeutral />
              </Center>
            ),
            value: "3",
          },
          {
            label: (
              <Center>
                <MoodSmile />
              </Center>
            ),
            value: "4",
          },
          {
            label: (
              <Center>
                <MoodHappy />
              </Center>
            ),
            value: "5",
          },
        ]}
      />
      <form onSubmit={onSubmit}>
        <Textarea
          mt="md"
          placeholder="Your comment"
          label="Your comment"
          description="Please be as descriptive as possible"
          autosize
          minRows={2}
          maxRows={10}
          {...form.getInputProps("feedback")}
        />
        <Select
          mt="md"
          label="Issue type"
          placeholder="Pick one"
          description="Pick the one that is closest, or choose 'other'"
          required
          {...form.getInputProps("type")}
          data={issueTypes}
        />
        <Button fullWidth mt="md" type="submit" loading={loadingCreateFeedback}>
          Send Feedback
        </Button>
        <Text color="dimmed" size="sm" align="center" mt="md">
          We take your feedback seriously, come back to see Toptierperk updates
        </Text>
      </form>
    </Drawer>
  );
}

export default AppFeedbackDrawer;
