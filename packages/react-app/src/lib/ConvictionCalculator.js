import { CONVICTION_MULTIPLIER } from "../constants";

const { ethers } = require("ethers");

export const calculateConviction = (amount, days) => {
  const daysToSeconds = days * 60 * 60;
  return truncate(amount + CONVICTION_MULTIPLIER * daysToSeconds * amount, 2);
};

const truncate = (number, digits) => {
  const shift = Math.pow(10, digits);
  return Math.trunc(number * shift) / shift;
};
