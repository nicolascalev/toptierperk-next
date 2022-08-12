import { useState } from "react";
import type { NextPage } from "next";
import { useUser } from "@auth0/nextjs-auth0";
import axios from "axios";
import useSWR from "swr";
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
  Badge,
  Loader,
  Box,
} from "@mantine/core";
import AppAcquirePerkButton from "components/AppAcquirePerkButton";
import AppWelcomeGuestModal from "components/AppWelcomeGuestModal";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertCircle } from "tabler-icons-react";
import formatDate from "helpers/formatDate";

import Benefit from "prisma/models/Benefit";
import AppPerkViewActions from "components/AppPerkViewActions";

interface Props {
  benefit: any;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const PerkDetailsPage: NextPage<Props> = ({ benefit }) => {
  const theme = useMantineTheme();
  const { user } = useUser();
  const isPerkAdmin = user && user.adminOfId === benefit.supplier.id;

  const { data: stats, error: loadStatsError }: any = useSWR(
    user && user.adminOfId === benefit.supplier.id
      ? `/api/benefit/${benefit.id}/stats`
      : null,
    fetcher
  );
  const loadingStats = !stats && !loadStatsError;

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

  const startsAtBorder =
    "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da");

  function getUseLimitMessage() {
    if (benefit.useLimit && benefit.useLimitPerUser) {
      return `There are ${benefit.useLimit} available in total, and ${benefit.useLimitPerUser} allowed per user`;
    }
    if (benefit.useLimit) {
      return `There are ${benefit.useLimit} available in total`;
    }
    if (benefit.useLimitPerUser) {
      return `There is a limit of ${benefit.useLimitPerUser} allowed claims per user.`;
    }
    return "This perk offer is unlimited";
  }

  function getPerkInactiveError(): string {
    if (!benefit.isActive) {
      return "This perk is not available for claims at the moment";
    }
    if (!benefit.supplier.paidMembership) {
      return "Perk currently unavailable, needs confirmation from supplier";
    }
    if (benefit.useLimit && benefit.claimAmount >= benefit.useLimit) {
      return "This perk reached use limit amount";
    }
    return "";
  }

  function userBusinessError(): string {
    if (!user?.business) {
      return "Must be a part of a business";
    }
    return "";
  }

  return (
    // TODO: add seo fields
    <div style={{ marginBottom: "49px" }}>
      {benefit.photos.length > 0 && (
        <div style={{ width: "100%", position: "relative" }}>
          <AspectRatio ratio={16 / 9} sx={{ width: "100%" }}>
            <Image
              src={benefit.photos[displayPhoto].url}
              alt={"Photo of " + benefit.name}
              onClick={openGallery}
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
            <ActionIcon color="dark" variant="light" onClick={carouselRight}>
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
            {displayPhoto + 1} / {benefit.photos.length}
          </Badge>
        </div>
      )}
      <Box
        p="md"
        sx={{
          borderBottom:
            "1px solid " + (isDark ? theme.colors.dark[5] : "#ced4da"),
        }}
      >
        <Text size="lg" weight={500}>
          {benefit.name}
        </Text>
        <Text>
          Offer by{" "}
          <span style={{ fontWeight: 500 }}>{benefit.supplier.name}</span>
        </Text>
        <Group mt="md">
          {user?.adminOfId && (
            <AppAcquirePerkButton
              variant="default"
              perkId={benefit.id}
              businessId={user.adminOfId as number}
            />
          )}
          {isPerkAdmin && (
            <Link href={`/perk/${benefit.id}/update`} passHref>
              <Button component="a" variant="default">
                Edit
              </Button>
            </Link>
          )}
        </Group>
      </Box>
      <div style={{ padding: theme.spacing.md }}>
        {getPerkInactiveError() && (
          <Alert
            mb="md"
            sx={{ zIndex: 1 }}
            icon={<AlertCircle size={16} />}
            title="Perk is not active"
            color="red"
          >
            {getPerkInactiveError()}
          </Alert>
        )}
        {/* STATS FOR ADMIN */}
        {isPerkAdmin && (
          // TODO: fetch stats (beneficiaries and available for)
          <Group grow mb="md">
            <div style={{ borderRight: startsAtBorder }}>
              <Text color="dimmed">Beneficiaries</Text>
              {loadingStats && <Loader size="sm" />}
              {!loadingStats && stats && <Text>{stats.beneficiaries}</Text>}
            </div>
            <div>
              <Text color="dimmed">Available for</Text>
              {loadingStats ? (
                <Loader size="sm" />
              ) : (
                <Text>
                  {benefit.isPrivate
                    ? !loadingStats &&
                      stats && <Text>{stats.availableFor}</Text>
                    : "Publicly available"}
                </Text>
              )}
            </div>
          </Group>
        )}
        <Text color="dimmed">Description</Text>
        <Text mb="md" style={{ whiteSpace: "pre-wrap" }}>
          {benefit.description}
        </Text>
        <Group grow mb="md">
          <div style={{ borderRight: startsAtBorder }}>
            <Text color="dimmed">Starts At</Text>
            <Text>{formatDate(benefit.startsAt, "SHORT_TEXT")}</Text>
          </div>
          <div>
            <Text color="dimmed">Finishes At</Text>
            <Text>
              {benefit.finishesAt
                ? formatDate(benefit.finishesAt, "SHORT_TEXT")
                : "No date limit"}
            </Text>
          </div>
        </Group>
        {/* USE LIMIT */}
        <Text color="dimmed">Use Limit</Text>
        <Text mb="md">{getUseLimitMessage()}</Text>
        {/* CATEGORIES */}
        <Text color="dimmed">Categories</Text>
        <Group mb="md">
          {benefit.categories.length === 0 && (
            <Text>No categories for this perk</Text>
          )}
          {benefit.categories.map((category: any) => (
            <Text key={category.id} weight={500} component="span">
              {category.name}
            </Text>
          ))}
        </Group>
        {/* SUPPLIER */}
        <Text color="dimmed">Supplier</Text>
        <Link href={"/business/" + benefit.supplier.id} passHref>
          <Card
            component="a"
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
        </Link>
      </div>
      <AppPerkViewActions perkName={benefit.name} />

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

      <AppWelcomeGuestModal />
    </div>
  );
};

export default PerkDetailsPage;

export async function getServerSideProps(ctx: any) {
  const perkId = Number(ctx.query.id);
  try {
    let benefit: any = await Benefit.findById(perkId);
    if (!benefit) {
      return { redirect: { destination: "/404", permanent: false } };
    }

    benefit.createdAt = benefit.createdAt?.getTime() || null;
    benefit.startsAt = benefit.startsAt?.getTime() || null;
    benefit.finishesAt = benefit.finishesAt?.getTime() || null;
    benefit.supplier.createdAt = benefit.supplier.createdAt?.getTime() || null;
    delete benefit.supplier.paypalSubscriptionId;

    return { props: { benefit } };
  } catch (err) {
    throw err;
  }
}
