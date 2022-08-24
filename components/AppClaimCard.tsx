import Link from "next/link";
import { Card, Group, Text } from "@mantine/core";
import { Calendar, Clock, Checks } from "tabler-icons-react";
import formatDate from "helpers/formatDate";
import { ReactNode } from "react";

function Detail({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Text
      color="dimmed"
      size="sm"
      style={{ display: "flex", alignItems: "center" }}
    >
      {icon}
      {label}
    </Text>
  );
}

type Props = {
  claim: any;
};
function AppClaimCard({ claim }: Props) {
  return (
    <Link href={`/claim/${claim.id}`} passHref>
      <Card component="a" withBorder mb="md">
        <Text color="dimmed" size="sm">{claim.supplier.name}</Text>
        <Text mb="md">{claim.benefit.name}</Text>
        <Group>
          <Detail
            label={formatDate(claim.createdAt, "SHORT_TEXT")}
            icon={<Calendar size={14} style={{ marginRight: 3 }} />}
          />
          {claim.approvedAt && (
            <Detail
              label="Verified"
              icon={<Checks size={14} style={{ marginRight: 3 }} />}
            />
            )}
          {!claim.approvedAt && (
            <Detail
              label="Pending"
              icon={<Clock size={14} style={{ marginRight: 3 }} />}
            />
          )}
        </Group>
      </Card>
    </Link>
  );
}

export default AppClaimCard;
