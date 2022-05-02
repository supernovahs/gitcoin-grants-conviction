import { Button, Card, Input, Spin, Row, Col, notification } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { ethers } from "ethers";
import InfiniteScroll from "react-infinite-scroller";
import { useDebounce } from "use-debounce";

import { BUIDL_GUIDL_API_ENDPOINT } from "../constants";

require("dotenv").config();

const { Meta } = Card;

export default function Home({ tokenBalance, cart, setCart }) {
  const [items, setItems] = useState([]);
  const [nextStart, setNextStart] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebounce(filter, 500);
  const [totalGrants, setTotalGrants] = useState(0);

  const limit = 50;

  let reset = false;

  const axiosConfig = {
    baseURL: BUIDL_GUIDL_API_ENDPOINT + "/grants",
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
    <div>
      <div
        style={{
          border: "1px solid #cccccc",
          padding: 16,
          width: 400,
          margin: "auto",
          marginTop: 64,
          marginBottom: 32,
        }}
      >
        <h2>Search</h2>
        <div style={{ margin: 4 }}>
          <Input
            onChange={e => {
              setFilter(e.target.value);
            }}
          />
        </div>
      </div>

      <div style={{ display: "block" }}>
        <div style={{ float: "left", marginBottom: 16 }}>Total grants found: {totalGrants}</div>
      </div>
      <div style={{ clear: "both" }}></div>

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
              <Col span={6} key={grant.id}>
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
                      disabled={cart.includes(grant)}
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
  );
}
