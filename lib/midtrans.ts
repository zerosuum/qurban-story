import midtransClient from "midtrans-client";

const midtransConfig = {
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
};

export const snap = new midtransClient.Snap(midtransConfig);
export const coreApi = new midtransClient.CoreApi(midtransConfig);
