import { ActionIcon, Button, Drawer, Select, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { User } from "@prisma/client";
import api from "config/api";
import { useState } from "react";
import { DotsVertical, UserX } from "tabler-icons-react";

type Props = {
  user: User;
  businessId: number;
  sessionUserId: number;
  onRemoveEmployee: (employeeId: number) => void;
};
function AppEmployeeUpdateButton({ user, businessId, sessionUserId, onRemoveEmployee }: Props) {
  const [opened, setOpened] = useState(false);

  const disabled = user.id === sessionUserId;

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
      await api
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

  async function onClickRemoveUser() {
    setLoadingUserChange(true);
    setOpened(false);
    try {
      await api
        .delete(`/api/business/${businessId}/employee/${user.id}`)
        .then((res:any) => res.data);
      showNotification({
        title: "User removed",
        message: "User was removed from employee list",
        autoClose: 3000,
      });
      onRemoveEmployee(user.id);
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
        {disabled && (
          <Text mb="md" color="dimmed" size="sm">
            You can not remove yourself or update your role
          </Text>
        )}
        <Select
          label="User authorization"
          placeholder="Pick one"
          required
          color="dark"
          value={role}
          onChange={onChangeRole}
          disabled={disabled}
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
          onClick={onClickRemoveUser}
          disabled={disabled}
        >
          Remove from business
        </Button>
      </Drawer>
    </>
  );
}

export default AppEmployeeUpdateButton;
