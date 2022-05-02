import {
  Button,
  Card,
  DatePicker,
  Divider,
  Drawer,
  Input,
  Progress,
  Slider,
  Spin,
  Switch,
  Row,
  Col,
  message,
  notification,
  Modal,
  List,
  Select,
  Skeleton,
  Statistic,
  Avatar,
  MenuProps,
  Menu,
  Dropdown,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { utils } from "ethers";
import { DeleteOutlined, EyeOutlined, ShoppingCartOutlined, LikeOutlined, LockOutlined } from "@ant-design/icons";
import { Address, Balance, Events } from "../components";
import axios from "axios";
import { ethers } from "ethers";
import InfiniteScroll from "react-infinite-scroller";
import { BigNumber } from "ethers";
import { useDebounce } from "use-debounce";
import { useStateCallback } from "../hooks/useStateCallback";

const { Meta } = Card;
const { Option } = Select;

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
  const [cart, setCart] = useStateCallback([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    console.log("tx address", readContracts.GTCStaking.address);
    console.log("tx amount", BigNumber.from(cartTotal));
    const result = tx(
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
              setCartTotal(0);
              onClose();
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
        }
      },
    );
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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
    }

    try {
      let res = await axiosClient.get(queryString);
      // Shuffle the results
      // We will need to repro this on the entire dataset on the backend
      let data = res.data.sort(() => Math.random() - 0.5);

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
    <>
      <Drawer title="Your grants" placement="right" onClose={onClose} size="large" width="736" visible={visible}>
        <List
          // loading={initLoading}
          itemLayout="horizontal"
          // loadMore={loadMore}
          dataSource={cart}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  onClick={() => {
                    setCart(cart.filter(_item => _item.id !== item.id));
                  }}
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined key="remove-from-cart" />}
                />,
              ]}
            >
              <Skeleton loading={false} title={false} active>
                <List.Item.Meta
                  avatar={<Avatar src={item.img} />}
                  title={item.title}
                  // description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                />
                <div>
                  <Select
                    placeholder="Duration"
                    onChange={value => {
                      item.duration = value;
                    }}
                  >
                    <Option value="1">1 day</Option>
                    <Option value="3">3 days</Option>
                    <Option value="7">7 days</Option>
                    <Option value="14">14 days</Option>
                    <Option value="30">30 days</Option>
                  </Select>
                </div>
                <div>
                  <Input
                    type={"number"}
                    placeholder="0"
                    value={item.amount ?? 0}
                    onChange={e => {
                      item.amount = Number.isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value);
                      e.target.value = item.amount;
                      setCartTotal(
                        cart.reduce((runnintTotal, _item) => {
                          const value = _item.amount ? parseFloat(_item.amount) : 0;
                          return runnintTotal + value;
                        }, 0),
                      );
                    }}
                  />
                </div>
              </Skeleton>
            </List.Item>
          )}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Balance"
              value={tokenBalance ? ethers.utils.formatEther(tokenBalance) : "..."}
              suffix=" GTC"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Staked"
              value={cartTotal}
              valueStyle={{
                color: tokenBalance?.gte(ethers.utils.parseEther(cartTotal.toString())) ? "#3f8600" : "#cf1322",
              }}
              suffix={"/ " + (tokenBalance ? ethers.utils.formatEther(tokenBalance) : "...")}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}></Col>
          <Col span={6}>
            <Button
              onClick={showModal}
              disabled={tokenBalance?.lt(ethers.utils.parseEther(cartTotal.toString()))}
              type="primary"
              shape="round"
              icon={<LockOutlined key="view-details" />}
            >
              Stake
            </Button>
          </Col>
        </Row>
      </Drawer>

      <Modal title="Confirm" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>By clicking OK you agree to stake your GTC tokens according to your selections:</p>
        <p>Remember: you will not be able to unstake your tokens until the set time!</p>
        <List
          // loading={initLoading}
          itemLayout="horizontal"
          // loadMore={loadMore}
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
      </Modal>

      <div>
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
            <div>Filter:</div>
            <Input
              onChange={e => {
                setFilter(e.target.value);
              }}
            />
            <div>Total grants found:</div>
            <span>{totalGrants}</span>
            <div>View cart:</div>
            <span>
              <Button
                onClick={() => {
                  showDrawer();
                }}
                type="primary"
                shape="circle"
                icon={<ShoppingCartOutlined key="view-cart" />}
              />
            </span>
          </div>
        </div>

        <InfiniteScroll
          loadMore={() => {
            !fetching && fetchGrants();
          }}
          hasMore={hasMoreItems}
          loader={
            <div className="loader" key={0}>
              <Spin />
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
                    actions={[
                      <Button
                        onClick={() => {
                          window.open(grant.url, "_blank");
                        }}
                        type="default"
                        shape="circle"
                        icon={<EyeOutlined key="view-details" />}
                      />,
                      <Button
                        onClick={() => {
                          if (cart.includes(grant)) {
                            notification["error"]({
                              message: "You already have this grant in your cart!",
                              description: `The grant for ${grant.title} is already in your cart.`,
                              duration: 3,
                              placement: "bottomRight",
                            });
                            return;
                          }
                          setCart([...cart, grant], () => {
                            notification["success"]({
                              message: "Added to cart",
                              description: `The grant for ${grant.title} has been added to your cart.`,
                              duration: 3,
                              placement: "bottomRight",
                            });
                          });
                        }}
                        type="default"
                        shape="circle"
                        icon={<ShoppingCartOutlined key="add-to-cart" />}
                      />,
                    ]}
                  >
                    <Meta title={grant.title} description={grant.description.substr(0, 100) + "..."} />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </InfiniteScroll>
      </div>
    </>
  );
}
