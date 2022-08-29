import { ActionIcon, Button, Drawer, Select } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { User } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { DotsVertical, UserX } from "tabler-icons-react";

type Props = {
  user: User;
  businessId: number;
};
function AppEmployeeUpdateButton({ user, businessId }: Props) {
  const [opened, setOpened] = useState(false);

  function getUserRole() {
    if (user.adminOfId) {
      return "admin";
    }
    if (user.canVerify) {
      return "verifier";
    }
    return "basic";
  }
  const [role, setRole] = useState<string | null>(getUserRole());

  const [loadingUserChange, setLoadingUserChange] = useState(false);
  async function onChangeRole(role: string) {
    setRole(role);
    setLoadingUserChange(true);
    setOpened(false);
    try {
      const updated = await axios
        .patch(`/api/business/${businessId}/employee/${user.id}`, { role })
        .then((res) => res.data);
      showNotification({
        title: "User updated",
        message: "User's role has been updated",
        autoClose: 3000,
      });
    } catch (err) {
      showNotification({
        title: "Error processing your request",
        message: "Please try again",
        color: "red",
      });
    } finally {
      setLoadingUserChange(false);
    }
  }

  return (
    <>
      <ActionIcon onClick={() => setOpened(true)} loading={loadingUserChange}>
        <DotsVertical size={14} />
      </ActionIcon>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={user.name}
        position="bottom"
        size="md"
        padding="md"
      >
        <Select
          label="User authorization"
          placeholder="Pick one"
          required
          color="dark"
          value={role}
          onChange={onChangeRole}
          data={[
            { value: "basic", label: "Basic" },
            {
              value: "verifier",
              label: "Verifier",
              description: "Can verify customer's qr codes",
            },
            {
              value: "admin",
              label: "Admin",
              description: "Has access to all admin functions",
            },
          ]}
        />
        <Button
          fullWidth
          color="red"
          mt="md"
          variant="outline"
          leftIcon={<UserX size={14} />}
        >
          Remove from business
        </Button>
      </Drawer>
    </>
  );
}

export default AppEmployeeUpdateButton;
