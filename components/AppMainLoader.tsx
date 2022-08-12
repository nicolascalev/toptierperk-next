import { Stack, Box } from "@mantine/core";
import AppLogo from "components/AppLogo";

type Props = {
  barRootColor?: string;
  barProgressColor?: string;
};
function AppMainLoader({ barRootColor, barProgressColor }: Props) {
  return (
    <Stack align="center" spacing="xs">
      <div className="main__loader__logo">
        <AppLogo height={64} />
      </div>
      <Box p="md">
        <div
          className="main__loader__bar__root"
          style={{ backgroundColor: barRootColor }}
        >
          <div
            className="main__loader__bar__progress"
            style={{ backgroundColor: barProgressColor }}
          ></div>
        </div>
      </Box>
    </Stack>
  );
}

export default AppMainLoader;
