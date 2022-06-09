import {
  Card,
  BackgroundImage,
  Text,
  Badge,
  Button,
  Group,
  ActionIcon,
  useMantineTheme,
  Divider,
} from "@mantine/core";
import { ChevronLeft, ChevronRight, Award } from 'tabler-icons-react';

export default function AppPerkCard(props: any) {
  const theme = useMantineTheme();

  const secondaryColor =
    theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7];

  const CardHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  }

  const CardPriceStyles = {
    alignSelf: "start",
  }

  return (
    <div style={{ width: 340, margin: "auto", paddingBottom: theme.spacing.md }}>
      <Card p="sm">
        <Card.Section>
          <BackgroundImage src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80">
            <div style={{ height: 160, margin: "auto", position: "relative" }}>
              {/* <ActionIcon variant="filled" color="bright-yellow" style={{ position: "absolute", left: theme.spacing.sm, bottom: theme.spacing.sm }}>
                <Award />
              </ActionIcon> */}
              <div
                style={{
                  position: "absolute",
                  right: theme.spacing.sm,
                  bottom: theme.spacing.sm,
                }}
              >
                <Group position="apart">
                  <ActionIcon color="dark" variant="light">
                    <ChevronLeft></ChevronLeft>
                  </ActionIcon>
                  <ActionIcon color="dark" variant="light">
                    <ChevronRight></ChevronRight>
                  </ActionIcon>
                </Group>
              </div>
            </div>
          </BackgroundImage>
        </Card.Section>


        <div
          style={CardHeaderStyles}
        >
          <div>
            <Text weight={700} size="sm" color="blue">Mc Donalds</Text>
            <Text weight={500}>Norway Fjord Adventures</Text>
          </div>
          <Badge color="gray" variant="light" style={CardPriceStyles}>
            $1.00
          </Badge>
        </div>

        <Text size="sm" style={{ color: secondaryColor, lineHeight: 1.5 }}>
          With Fjord Tours you can explore more of the magical fjord landscapes
          with tours and activities on and around the fjords of Norway
        </Text>

        <div>
          <Text color="blue" size="sm" component="span" style={{ marginRight: theme.spacing.xs }}>#Food</Text>
          <Text color="blue" size="sm" component="span" style={{ marginRight: theme.spacing.xs }}>#Pet friendly</Text>
          <Text color="blue" size="sm" component="span" style={{ marginRight: theme.spacing.xs }}>#Travel</Text>
          <Text color="blue" size="sm" component="span" style={{ marginRight: theme.spacing.xs }}>#Nature</Text>
        </div>
      </Card>
    </div>
  );
}
