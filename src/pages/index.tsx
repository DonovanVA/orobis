import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  Footer,
  Aside,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
} from "@mantine/core";
import AutomataBlueprint from "@/components/automataBlueprint";
import InfiniteCanvas from "@/components/InfiniteCanvas/InfiniteCanvas";

export default function Home() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
 
      <InfiniteCanvas height={1000} width={1000} />
  );
}
