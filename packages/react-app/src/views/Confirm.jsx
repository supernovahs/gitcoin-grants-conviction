import { Button, List, Skeleton, Avatar } from "antd";
import React from "react";
import { RollbackOutlined, CheckOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { BigNumber } from "ethers";
import { useHistory } from "react-router-dom";

export default function Confirm({ tx, readContracts, writeContracts, cart, setCart }) {
  const history = useHistory();

  const handleOk = () => {
    const cartTotal = cart.reduce((runnintTotal, _item) => {
      const value = _item.amount ? parseFloat(_item.amount) : 0;
      return runnintTotal + value;
    }, 0);
    console.log("tx address", readContracts.GTCStaking.address);
    console.log("tx amount", BigNumber.from(cartTotal));
    tx(
      writeContracts.GTC.approve(readContracts.GTCStaking.address, ethers.utils.parseEther(cartTotal.toString())),
      update => {
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
          // Staking
          const votes = cart.map(item => {
            console.log("tx duration", Math.floor(Date.now() / 1000) + 60 * 60 * 24 * item.duration);
            return {
              grantId: item.id,
              amount: ethers.utils.parseEther(item.amount ? item.amount.toString() : "0"),
              lockedUntil: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * item.duration,
            };
          });
          console.log("🗳 Sending votes:", votes);
          tx(writeContracts.GTCStaking.voteBatch(votes), update => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              setCart([]);

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
              history.push("/success");
            }
          });
        }
      },
    );
  };

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
      <p>By clicking OK you agree to stake your GTC tokens according to your selections:</p>
      <p>Remember: you will not be able to unstake your tokens until the set time!</p>
      <List
        itemLayout="horizontal"
        dataSource={cart}
        renderItem={item => (
          <List.Item>
            <Skeleton loading={false} title={false} active>
              <List.Item.Meta avatar={<Avatar src={item.img} />} title={item.title} />
              <div>
                Duration: {item.duration} days
                <br />
                Amount: {item.amount ?? 0} GTC
              </div>
            </Skeleton>
          </List.Item>
        )}
      />
      <div style={{ padding: "26px" }}>
        <Button
          onClick={() => {
            history.push("/checkout");
          }}
          style={{ marginRight: "16px" }}
          shape="round"
          icon={<RollbackOutlined key="view-details" />}
        >
          Cancel
        </Button>
        <Button onClick={handleOk} type="primary" shape="round" icon={<CheckOutlined key="view-details" />}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
