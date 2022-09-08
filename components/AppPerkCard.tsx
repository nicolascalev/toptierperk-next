import {
  Card,
  Text,
  Group,
  ActionIcon,
  useMantineTheme,
  AspectRatio,
  Image,
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Fence,
  Lock,
  LockOpen,
  Calendar,
} from "tabler-icons-react";
import formatDate, { timeAgo } from "helpers/formatDate";
import Link from "next/link";
import { Carousel } from "@mantine/carousel";
import { Photo } from "@prisma/client";
import { ReactNode } from "react";
import pretty from "helpers/prettyNumber";

function Attribute({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Text
      size="sm"
      color="dimmed"
      style={{ display: "flex", alignItems: "center", gap: 3 }}
    >
      {icon}
      {label}
    </Text>
  );
}

interface Props {
  perk: any;
  disableTopBar?: boolean;
}

export default function AppPerkCard(props: Props) {
  const theme = useMantineTheme();
  const router = useRouter();

  if (!props.perk) {
    throw new Error("perk prop must be provided");
  }

  function clickShare(e: any) {
    e.stopPropagation();
    const shareData = {
      title: props.perk.name,
      text: "Toptierperk, making B2B perks available for everyone",
      url: window.location.origin + `/perk${props.perk.id}`,
    };
    navigator.share(shareData).then(() => {
      showNotification({
        title: "Shared",
        message: "Thanks for sharing this perk!",
        autoClose: 5000,
      });
    });
  }

  const slides = props.perk.photos.map((photo: Photo) => (
    <Carousel.Slide key={photo.url} style={{ maxHeight: "100%" }}>
      <AspectRatio ratio={16 / 9} sx={{ width: "100%" }}>
        <Image fit="fill" src={photo.url} alt={"Photo of " + props.perk.name} />
      </AspectRatio>
    </Carousel.Slide>
  ));

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
          <Link href={`/business/${props.perk.supplier.name}`} passHref>
            <Anchor component="a">
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
            </Anchor>
          </Link>
          <Text size="sm" color="dimmed">
            {timeAgo(props.perk.createdAt)}
          </Text>
        </Group>
      )}
      <Card p="sm">
        <Card.Section>
          <Carousel
            sx={{ maxWidth: "100%" }}
            mx="auto"
            withIndicators
            loop
            nextControlIcon={<ChevronRight size={16} />}
            previousControlIcon={<ChevronLeft size={16} />}
            breakpoints={[
              { maxWidth: "md", slideSize: "50%" },
              { maxWidth: "sm", slideSize: "100%", slideGap: 0 },
            ]}
            styles={{
              control: {
                "&[data-inactive]": {
                  opacity: 0,
                  cursor: "default",
                },
              },
            }}
          >
            {slides}
          </Carousel>
        </Card.Section>

        <div onClick={() => router.push("/perk/" + props.perk.id)}>
          <Group position="apart" py="sm" noWrap>
            <Text>{props.perk.name}</Text>
            <ActionIcon
              style={{ alignSelf: "start" }}
              size="sm"
              onClick={clickShare}
            >
              <Upload size={16} />
            </ActionIcon>
          </Group>

          {props.perk.categories.length > 0 && (
            <Group>
              {props.perk.categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  passHref
                >
                  <Anchor
                    component="a"
                    color="blue"
                    size="sm"
                    onClick={(e: any) => e.stopPropagation()}
                  >
                    {category.name}
                  </Anchor>
                </Link>
              ))}
            </Group>
          )}
          <Group pt="sm">
            <Attribute
              icon={
                props.perk.isPrivate ? (
                  <Lock size={12} />
                ) : (
                  <LockOpen size={12} />
                )
              }
              label={props.perk.isPrivate ? "Private" : "Public"}
            />
            {props.perk.startsAt && (
              <Attribute
                icon={<Calendar size={12} />}
                label={"Starts " + formatDate(props.perk.startsAt, "SHORT_TEXT")}
              />
            )}
            {/* {props.perk.useLimit && (
              <Attribute
                icon={<Fence size={12} />}
                label={"Total limit " + pretty(props.perk.useLimit)}
              />
            )}
            {props.perk.useLimitPerUser && (
              <Attribute
                icon={<Fence size={12} />}
                label={"Limit per user " + pretty(props.perk.useLimitPerUser)}
              />
            )} */}
          </Group>
        </div>
      </Card>
    </div>
  );
}
