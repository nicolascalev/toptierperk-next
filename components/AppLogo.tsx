import logo from "public/logo.png";
import logoLight from "public/logo-light.png";
import { useMantineTheme, Image } from "@mantine/core";

export default function AppLogo({ height = 25 }: { height?: number }) {
  const theme = useMantineTheme();
  const isLight = theme.colorScheme === "light";

  const source = isLight ? logo.src : logoLight.src;
  const alt = isLight ? "Toptierperk logo" : "Toptierperk light logo";

  return <Image height={height} src={source} alt={alt} />;
}
