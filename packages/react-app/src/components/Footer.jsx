import { Layout } from "antd";
import React from "react";

// displays a page header

export default function ScaffoldFooter() {
  const { Footer } = Layout;
  return <></>;
  return (
    <Footer style={{ textAlign: "center", background: "transparent" }}>
      Created by{" "}
      <a href="https://twitter.com/DanieleSalatti" target="_blank">
        Daniele Salatti
      </a>{" "}
      and the{" "}
      <a href="https://buidlguidl.com" target="_blank">
        BuidlGuidl
      </a>{" "}
      using{" "}
      <a href="https://github.com/scaffold-eth/scaffold-eth" target="_blank">
        🏗 scaffold-eth
      </a>
    </Footer>
  );
}
