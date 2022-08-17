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
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Share } from "tabler-icons-react";
import { timeAgo } from "helpers/formatDate";

interface Props {
  perk: any,
  disableTopBar?: boolean,
}

export default function AppPerkCard(props: Props) {
  const theme = useMantineTheme();
  const router = useRouter();

  if (!props.perk) {
    throw new Error("perk prop must be provided");
  }

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

  function clickShare(e: any) {
    e.stopPropagation();
    // TODO: add drawer, use native share or copy url, or get qr...
    const shareData = {
      title: props.perk.name,
      text: "Toptierperk, making B2B perks available for everyone",
      url: window.location.origin + `/perk${props.perk.id}`,
    };
    navigator
      .share(shareData)
      .then(() => {
        showNotification({
          title: "Shared",
          message: "Thanks for sharing this perk!",
          autoClose: 5000,
        });
      })
      .catch(() => {
        showNotification({
          title: "Not available",
          message: "Sharing is not available for your device",
          autoClose: 5000,
        });
      });
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
      {props.disableTopBar !== true && (
        <Group position="apart" align="center" py="sm">
          <Group align="center" spacing={4}>
            <Image
              width={25}
              height={25}
              radius={100}
              src={
                props.perk.supplier.logo?.url ||
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              }
              alt={"Toptierperk " + props.perk.supplier.name}
            />
            <Text size="sm" color="dimmed">
              {props.perk.supplier.name}
            </Text>
          </Group>
          <Text size="sm" color="dimmed">
            {timeAgo(props.perk.createdAt)}
          </Text>
        </Group>
      )}
      <Card p="sm" onClick={() => router.push("/perk/" + props.perk.id)}>
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
        <Group position="apart" py="sm">
          <Text>{props.perk.name}</Text>
          <ActionIcon
            style={{ alignSelf: "start" }}
            size="sm"
            onClick={clickShare}
          >
            <Share />
          </ActionIcon>
        </Group>

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
