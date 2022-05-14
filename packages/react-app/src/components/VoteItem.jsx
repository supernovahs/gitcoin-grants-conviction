import { List, Skeleton, Avatar, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

export default function VoteItem({ item, onCheckCallback }) {
  const [loading, setLoading] = useState(true);
  const [grantDetails, setGrantDetails] = useState({});

  function onChange(e) {
    onCheckCallback(item, e.target.checked);
  }

  const axiosConfig = {
    baseURL: BUIDL_GUIDL_API_ENDPOINT + "/grant",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  const fetchGrantDetails = async item => {
    try {
      let res = await axiosClient.get(`/${item.grantId}`);
      setGrantDetails(res.data[0]);
      setLoading(false);
    } catch (error) {
      console.log("🗳 Error:", error);
    }
  };

  useEffect(() => {
    void fetchGrantDetails(item);
  }, [item]);

  return (
    <List.Item>
      <Skeleton loading={loading} title={false} active>
        {item && (
          <>
            <List.Item.Meta avatar={<Avatar src={grantDetails.img} />} title={grantDetails.title} />
            <div style={{ float: "right", marginLeft: "16px" }}>
              Amount: {ethers.utils.formatEther(item.totalStaked)} GTC
            </div>

            <Checkbox onChange={onChange} style={{ marginLeft: "16px" }}>
              Unstake
            </Checkbox>
          </>
        )}
      </Skeleton>
    </List.Item>
  );
}
