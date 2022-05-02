import { List, Statistic } from "antd";
import React from "react";

import VoteItem from "../components/VoteItem";

export default function Dashboard({ votes, tx, readContracts, writeContracts }) {
  console.log("🗳 Votes:", votes);

  return (
    <div
      style={{
        border: "1px solid #cccccc",
        padding: 16,
        width: "50%",
        margin: "auto",
        marginTop: 64,
        marginBottom: 32,
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={votes}
        renderItem={item => (
          <VoteItem item={item} tx={tx} readContracts={readContracts} writeContracts={writeContracts} />
        )}
      />
    </div>
  );
}
