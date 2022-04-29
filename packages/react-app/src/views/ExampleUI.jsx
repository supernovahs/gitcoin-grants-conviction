import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { utils } from "ethers";
import { ShoppingCartOutlined, SyncOutlined } from "@ant-design/icons";
import { Address, Balance, Events } from "../components";
import axios from "axios";
import { ethers } from "ethers";
import InfiniteScroll from "react-infinite-scroller";

const { Meta } = Card;

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  tokenBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  currentTimestamp,
}) {
  const [amount, setAmount] = useState();
  const [vote, setVote] = useState();
  const [items, setItems] = useState([]);
  const [nextStart, setNextStart] = useState(0);
  const [fetching, setFetching] = useState(false);

  const limit = 50;

  const axiosConfig = {
    baseURL: "http://localhost:3001/grants",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  const fetchGrants = useCallback(async () => {
    if (fetching) {
      return;
    }
    setFetching(true);

    try {
      let res = await axiosClient.get(`?_start=${nextStart}&_limit=${limit}`);
      let data = res.data;

      setItems([...items, ...data]);

      if (res.headers["x-total-count"] > nextStart + limit) {
        setNextStart(nextStart + limit);
      } else {
        setNextStart(-1);
      }
    } finally {
      setFetching(false);
    }
  }, [items, fetching, nextStart]);

  useEffect(() => {
    fetchGrants();
  }, []);

  useEffect(() => {
    if (tokenBalance) console.log("Your new token balance is", ethers.utils.formatEther(tokenBalance?.toString()));
  }, [tokenBalance]);

  const hasMoreItems = nextStart !== -1;

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <Events
        address={address}
        contracts={readContracts}
        contractName="GTCStaking"
        eventName="VoteCasted"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
        currentTimestamp={currentTimestamp}
        tx={tx}
        readContracts={readContracts}
        writeContracts={writeContracts}
      />

      <div
        style={{
          border: "1px solid #cccccc",
          padding: 16,
          width: 400,
          margin: "auto",
          marginTop: 64,
          marginBottom: 64,
        }}
      >
        <h2>Example UI:</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <div>Your Balance: {tokenBalance ? ethers.utils.formatEther(tokenBalance) : "..."}</div>
          Amount of tokens to stake:
          <Input
            onChange={e => {
              setAmount(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(
                writeContracts.YourToken.approve(readContracts.YourContract.address, ethers.utils.parseEther(amount)),
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
                  }
                },
              );
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Approve
          </Button>
          <div>Your Vote:</div>
          <Input
            onChange={e => {
              setVote(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.YourContract.vote(vote, ethers.utils.parseEther(amount)), update => {
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
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Vote
          </Button>
        </div>
      </div>

      <InfiniteScroll
        className=""
        // pageStart={0}
        loadMore={() => {
          !fetching && fetchGrants();
        }}
        hasMore={hasMoreItems}
        loader={
          <div className="loader" key={0}>
            Loading ...
          </div>
        }
      >
        <Row gutter={[24, 16]}>
          {items.map(grant => {
            return (
              <Col span={6}>
                <Card
                  hoverable
                  style={{ width: 240 }}
                  cover={<img alt="example" src={grant.img} />}
                  actions={[<ShoppingCartOutlined key="add-to-cart" />]}
                >
                  <Meta title={grant.title} description={grant.description.substr(0, 100) + "..."} />
                </Card>
              </Col>
            );
          })}
        </Row>
      </InfiniteScroll>
    </div>
  );
}
