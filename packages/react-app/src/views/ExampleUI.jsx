import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { utils } from "ethers";
import { ShoppingCartOutlined, SyncOutlined } from "@ant-design/icons";
import { Address, Balance, Events } from "../components";
import axios from "axios";
import { ethers } from "ethers";
import InfiniteScroll from "react-infinite-scroller";

import { useDebounce } from "use-debounce";

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
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebounce(filter, 500);
  const [totalGrants, setTotalGrants] = useState(0);

  const limit = 50;

  let reset = false;

  const axiosConfig = {
    baseURL: "http://localhost:3001/grants",
    timeout: 30000,
  };

  const axiosClient = axios.create(axiosConfig);

  const fetchGrants = useCallback(async () => {
    if (fetching || (nextStart === -1 && !reset)) {
      return;
    }
    let start = nextStart;
    if (reset) {
      start = 0;
      setNextStart(0);
      reset = false;
    }
    setFetching(true);

    let queryString = `?_start=${start}&_limit=${limit}`;
    if (filter) {
      queryString += `&q=${filter}`;
      console.log("grants query", queryString);
    }

    try {
      let res = await axiosClient.get(queryString);
      let data = res.data;

      if (start === 0) {
        setItems(data);
      } else {
        setItems([...items, ...data]);
      }

      setTotalGrants(res.headers["x-total-count"]);
      if (res.headers["x-total-count"] > start + limit) {
        setNextStart(start + limit);
      } else {
        setNextStart(-1);
      }
    } finally {
      setFetching(false);
    }
  }, [items, fetching, nextStart, debouncedFilter]);

  useEffect(() => {
    fetchGrants();
  }, []);

  useEffect(() => {
    if (filter.length < 4 && filter.length > 0) return;
    reset = true;
    fetchGrants();
  }, [debouncedFilter]);

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
        <h2>Gitcoin Conviction Staking</h2>
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
          <div>Filter:</div>
          <Input
            onChange={e => {
              setFilter(e.target.value);
            }}
          />
          <span>Total grants found: {totalGrants}</span>
        </div>
      </div>

      <InfiniteScroll
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
