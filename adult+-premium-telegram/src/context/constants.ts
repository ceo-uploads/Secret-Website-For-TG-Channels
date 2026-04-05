import { Package, TelegramChannel } from "../types";

export const PACKAGES: Package[] = [
  // 24 Hours
  { id: "1-D1", name: "Package 1-D1 (1000 Channels)", channels: 1000, priceBDT: 400, durationDays: 1 },
  { id: "2-D1", name: "Package 2-D1 (1500 Channels)", channels: 1500, priceBDT: 700, durationDays: 1 },
  { id: "3-D1", name: "Package 3-D1 (2500 Channels)", channels: 2500, priceBDT: 900, durationDays: 1 },
  { id: "4-D1", name: "Package 4-D1 (5000 Channels)", channels: 5000, priceBDT: 1900, durationDays: 1 },
  // 1 Week
  { id: "1-W1", name: "Package 1-W1 (1000 Channels)", channels: 1000, priceBDT: 1000, durationDays: 7 },
  { id: "2-W1", name: "Package 2-W1 (1500 Channels)", channels: 1500, priceBDT: 1500, durationDays: 7 },
  { id: "3-W1", name: "Package 3-W1 (2500 Channels)", channels: 2500, priceBDT: 2500, durationDays: 7 },
  { id: "4-W1", name: "Package 4-W1 (5000 Channels)", channels: 5000, priceBDT: 4000, durationDays: 7 },
  // Lifetime
  { id: "Lifetime", name: "Package Lifetime (5000 Channels)", channels: 5000, priceBDT: 122000, priceUSD: 1000, durationDays: 36500 },
];

export const getChannels1000 = () => {
  const data = {
    "1": { name: "Premium Channel 1", link: "https://t.me/joinchat/sample_1000_1" },
    "2": { name: "Premium Channel 2", link: "https://t.me/joinchat/sample_1000_2" },
    "3": { name: "Premium Channel 3", link: "https://t.me/joinchat/sample_1000_3" },
    // Add more here manually
  };
  return Object.values(data);
};

export const getChannels1500 = () => {
  const data = {
    "1": { name: "Premium Channel 1", link: "https://t.me/joinchat/sample_1500_1" },
    "2": { name: "Premium Channel 2", link: "https://t.me/joinchat/sample_1500_2" },
    // Add more here manually
  };
  return Object.values(data);
};

export const getChannels2500 = () => {
  const data = {
    "1": { name: "Premium Channel 1", link: "https://t.me/joinchat/sample_2500_1" },
    "2": { name: "Premium Channel 2", link: "https://t.me/joinchat/sample_2500_2" },
    // Add more here manually
  };
  return Object.values(data);
};

export const getChannels5000 = () => {
  const data = {
    "1": { name: "Premium Channel 1", link: "https://t.me/joinchat/sample_5000_1" },
    "2": { name: "Premium Channel 2", link: "https://t.me/joinchat/sample_5000_2" },
    // Add more here manually
  };
  return Object.values(data);
};

export const SAMPLE_CHANNELS: Record<string, () => TelegramChannel[]> = {
  "1000": getChannels1000,
  "1500": getChannels1500,
  "2500": getChannels2500,
  "5000": getChannels5000,
};
