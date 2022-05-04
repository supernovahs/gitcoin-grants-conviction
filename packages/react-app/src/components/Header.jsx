import { PageHeader, Tag, Statistic, Row } from "antd";
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
            <Tag color="blue" style={{ marginLeft: "20px" }}>
              <a href="https://convictionvoting.wtf" target="_blank">
                What is Conviction Voting
              </a>
            </Tag>
          </Row>
        }
      />
    </a>
  );
}

Header.defaultProps = {
  link: "/",
  title: "Gitcoin Conviction Voting",
  subTitle: "Signal support for your favourite grants",
};
