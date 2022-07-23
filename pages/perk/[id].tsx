import { useState } from "react";
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import {
  useMantineTheme,
  AspectRatio,
  Image,
  Text,
  Button,
  Group,
  ActionIcon,
  Drawer,
  ScrollArea,
  SimpleGrid,
  Alert,
  Card,
  Center,
} from "@mantine/core";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  AlertCircle,
} from "tabler-icons-react";

import Benefit from "../../prisma/models/Benefit";

interface Props {
  user: any;
  benefit: any;
}

const PerkDetailsPage: NextPage<Props> = ({ user, benefit }) => {
  const theme = useMantineTheme();

  const [displayPhoto, setDisplayPhoto] = useState(0);
  function carouselLeft() {
    if (displayPhoto == 0) {
      return;
    }
    setDisplayPhoto(displayPhoto - 1);
  }
  function carouselRight() {
    if (displayPhoto == benefit.photos.length - 1) {
      return;
    }
    setDisplayPhoto(displayPhoto + 1);
  }

  const [openedGallery, setOpenedGallery] = useState(false);
  function openGallery(e: any) {
    e.stopPropagation();
    setOpenedGallery(true);
  }

  const isDark = theme.colorScheme === "dark";
  const perkActionsStyles = {
    backgroundColor: isDark ? theme.colors.dark[7] : "white",
    padding: theme.spacing.md,
    position: "sticky" as any,
    top: 49,
    borderBottom: "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da"),
    zIndex: 10,
  };

  const startsAtBorder =
    "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da");

  return (
    // TODO: add seo fields
    <div style={{ minHeight: "100vh", marginBottom: "49px" }}>
      <div style={{ width: "100%", position: "relative" }}>
        <AspectRatio ratio={16 / 9} sx={{ width: "100%" }}>
          <Image
            src={benefit.photos[displayPhoto].url}
            alt={"Photo of " + benefit.name}
            onClick={openGallery}
          />
        </AspectRatio>
        <Button
          leftIcon={<LayoutGrid />}
          color="dark"
          variant="light"
          size="xs"
          onClick={openGallery}
          style={{
            position: "absolute",
            top: theme.spacing.md,
            right: theme.spacing.md,
          }}
        >
          Show All
        </Button>
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
      </div>
      <div style={perkActionsStyles}>
        <Text size="xl" weight={500}>
          {benefit.name}
        </Text>
        <Text>
          Offer by{" "}
          <span style={{ fontWeight: 500 }}>{benefit.supplier.name}</span>
        </Text>
        <Group mt="md">
          <Button variant="default">Acquire</Button>
          <Button variant="default">Claim</Button>
        </Group>
      </div>
      <div style={{ padding: theme.spacing.md }}>
        {benefit.isActive === false && (
          <Alert
            mb="md"
            sx={{ zIndex: 1 }}
            icon={<AlertCircle size={16} />}
            title="Perk is not active"
            color="red"
          >
            At this moment this perk can&apos;t be used
          </Alert>
        )}
        <Text color="dimmed">Description</Text>
        <Text mb="md">{benefit.description}</Text>
        <Group grow mb="md">
          <div style={{ borderRight: startsAtBorder }}>
            <Text color="dimmed">Starts At</Text>
            <Text>Apr 18th</Text>
          </div>
          <div>
            <Text color="dimmed">Finishes At</Text>
            <Text>Apr 18th</Text>
          </div>
        </Group>
        <Text color="dimmed">Use Limit</Text>
        <Text mb="md">Get use limit message it depends</Text>
        <Text color="dimmed">Categories</Text>
        <Group mb="md">
          <Text weight={500} component="span">
            Food
          </Text>
          <Text weight={500} component="span">
            Sports
          </Text>
          <Text weight={500} component="span">
            Family
          </Text>
        </Group>
        <Text color="dimmed">Supplier</Text>
        <Card
          style={{
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            marginTop: theme.spacing.md,
          }}
        >
          {benefit.supplier.logo && (
            <Center>
              <Image
                src={benefit.supplier.logo.url}
                alt={benefit.supplier.name}
                radius={100}
                width={32}
                height={32}
              ></Image>
            </Center>
          )}
          <Text weight={500} align="center">
            {benefit.supplier.name}
          </Text>
          <Text align="center">{benefit.supplier.about}</Text>
        </Card>
      </div>

      <Drawer
        opened={openedGallery}
        onClose={() => setOpenedGallery(false)}
        position="bottom"
        title="Photos"
        size="xl"
        styles={{
          header: { padding: theme.spacing.md, marginBottom: 0 },
        }}
      >
        <div style={{ padding: theme.spacing.md, paddingTop: 0 }}>
          <Text color="dimmed" size="sm">
            {benefit.photos.length} photos
          </Text>
        </div>

        <ScrollArea type="auto" style={{ height: "375px" }}>
          <SimpleGrid cols={3} spacing={1}>
            {benefit.photos.map((photo: any, index: number) => (
              <AspectRatio
                key={index}
                ratio={1 / 1}
                style={{ width: "100%", display: "block" }}
              >
                <Image src={photo.url} alt={"Photo of " + benefit.name} />
              </AspectRatio>
            ))}
          </SimpleGrid>
        </ScrollArea>
      </Drawer>
    </div>
  );
};

export default PerkDetailsPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    // access the user session
    // const session = getSession(ctx.req, ctx.res);

    const perkId = Number(ctx.query.id);
    try {
      let benefit: any = await Benefit.findById(perkId);
      if (!benefit) {
        return { props: { benefit } };
      }

      benefit.createdAt = benefit.createdAt?.getTime() || null;
      benefit.startsAt = benefit.startsAt?.getTime() || null;
      benefit.finishesAt = benefit.finishesAt?.getTime() || null;
      benefit.supplier.createdAt =
        benefit.supplier.createdAt?.getTime() || null;
      delete benefit.supplier.paypalSubscriptionId;

      return { props: { benefit } };
    } catch (err) {
      throw err;
    }
  },
});
