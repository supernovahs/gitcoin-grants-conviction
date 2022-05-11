import { PageHeader, Tag, Statistic, Row } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import React from "react";

// displays a page header

export default function Header({ link, title, subTitle }) {
  return (
    <a href={link}>
      <PageHeader
        title={title}
        subTitle={subTitle}
        style={{ cursor: "pointer" }}
        tags={
          <Row>
            <a href="https://convictionvoting.wtf" target="_blank">
              <InfoCircleOutlined />
            </a>
          </Row>
        }
      />
    </a>
  );
}

Header.defaultProps = {
  link: "/",
  title: "🤖 Gitcoin Conviction 🗳",
  subTitle: "Stake GTC to support your favorite grants!",
};
