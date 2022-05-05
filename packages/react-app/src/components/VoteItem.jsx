import { Button, List, Skeleton, Avatar, Statistic } from "antd";
import React, { useEffect, useState } from "react";
import { UnlockOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import axios from "axios";

import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

const { Countdown } = Statistic;
export default function VoteItem({ item, tx, readContracts, writeContracts }) {
  const [loading, setLoading] = useState(true);
  const [grantDetails, setGrantDetails] = useState({});
  let nowInSeconds = Math.floor(new Date().getTime() / 1000);
  const [canUnstake, setCanUnstake] = useState(nowInSeconds > item.lockedUntil);

  const handleUnstake = voteId => {
    console.log("tx address", readContracts.GTCStaking.address);

    tx(writeContracts.GTCStaking.releaseTokens(voteId), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    });
  };

  const axiosConfig = {
    baseURL: BUIDL_GUIDL_API_ENDPOINT + "/grant",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  useEffect(
    () => async () => {
      try {
        let res = await axiosClient.get(`/${item.grantId}`);
        setGrantDetails(res.data[0]);
        setLoading(false);
      } catch (error) {
        console.log("🗳 Error:", error);
      }
    },
    [item],
  );

  return (
    <List.Item>
      <Skeleton loading={loading} title={false} active>
        <List.Item.Meta avatar={<Avatar src={grantDetails.img} />} title={grantDetails.title} />
        <div style={{ float: "right", marginLeft: "16px" }}>
          <Countdown
            valueStyle={{ fontSize: "16px" }}
            title="Time remaining"
            value={item.lockedUntil.toString() * 1000}
            format={`D [days], HH:mm:ss`}
            onFinish={() => {
              setCanUnstake(true);
            }}
          />
          Amount: {ethers.utils.formatEther(item.amount)} GTC
        </div>
        <Button
          style={{ marginLeft: "16px" }}
          onClick={() => {
            handleUnstake(item.voteId);
          }}
          type="primary"
          shape="round"
          disabled={!canUnstake}
          icon={<UnlockOutlined key="unstake" />}
        >
          Unstake
        </Button>
      </Skeleton>
    </List.Item>
  );
}
