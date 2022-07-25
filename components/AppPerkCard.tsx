import {
  Card,
  Text,
  Group,
  ActionIcon,
  useMantineTheme,
  AspectRatio,
  Badge,
  Image,
} from "@mantine/core";
import { useRouter } from "next/router"
import { useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark } from "tabler-icons-react";

export default function AppPerkCard(props: any) {
  const theme = useMantineTheme();
  const router = useRouter();

  if (!props.perk) {
    throw new Error("perk prop must be provided");
  }

  const secondaryColor =
    theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7];

  const CardHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  };

  const [displayPhoto, setDisplayPhoto] = useState(0);
  function carouselLeft(e: any) {
    e.stopPropagation();
    if (displayPhoto == 0) {
      return;
    }
    setDisplayPhoto(displayPhoto - 1);
  }
  function carouselRight(e: any) {
    e.stopPropagation();
    if (displayPhoto == props.perk.photos.length - 1) {
      return;
    }
    setDisplayPhoto(displayPhoto + 1);
  }

  return (
    <div
      style={{
        width: 340,
        margin: "auto",
        paddingBottom: theme.spacing.md,
        zIndex: 1,
      }}
    >
      <Card p="sm" onClick={() => router.push('/perk/' + props.perk.id)}>
        <Card.Section>
          {props.perk.photos.length > 0 && (
            <div style={{ width: "100%", position: "relative" }}>
              <AspectRatio ratio={16 / 9} sx={{ width: "100%" }}>
                <Image
                  src={props.perk.photos[displayPhoto].url}
                  alt={"Photo of " + props.perk.name}
                />
              </AspectRatio>
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
              <Badge
                color="gray"
                style={{
                  position: "absolute",
                  bottom: theme.spacing.md,
                  left: theme.spacing.md,
                }}
              >
                {displayPhoto + 1} / {props.perk.photos.length}
              </Badge>
            </div>
          )}
        </Card.Section>

        {/* TODO: add functionality like links and save button */}
        <div style={CardHeaderStyles}>
          <div>
            <Text weight={500} size="sm">
              {props.perk.supplier.name}
            </Text>
            <Text>{props.perk.name}</Text>
          </div>
          <ActionIcon style={{ alignSelf: "start" }}>
            <Bookmark />
          </ActionIcon>
        </div>

        {/* <Text size="sm" style={{ color: secondaryColor, lineHeight: 1.5 }}>
          With Fjord Tours you can explore more of the magical fjord landscapes
          with tours and activities on and around the fjords of Norway
        </Text> */}

        {props.perk.categories.length > 0 && (
          <Group>
            {props.perk.categories.map((category: any) => (
              <Text key={category.id} color="blue" size="sm" component="span">
                {category.name}
              </Text>
            ))}
          </Group>
        )}
      </Card>
    </div>
  );
}
