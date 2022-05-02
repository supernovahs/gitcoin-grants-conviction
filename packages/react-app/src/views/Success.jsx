import React from "react";
import { Result, Button } from "antd";
import { useHistory } from "react-router-dom";

export default function Success({ yourLocalBalance, mainnetProvider, price, address }) {
  const history = useHistory();

  return (
    <Result
      status="success"
      title="Success!"
      subTitle="You successfully staked your tokens!"
      extra={[
        <Button
          type="primary"
          key="home"
          onClick={() => {
            history.push("/");
          }}
        >
          Home
        </Button>,
      ]}
    />
  );
}
