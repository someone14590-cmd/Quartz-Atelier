const BLOCKCHAIR_BASE = "https://api.blockchair.com";
const MAX_TX_CHECK = 25;

const COIN_CONFIG = {
  BTC: { chain: "bitcoin", type: "utxo", decimals: 8, addressEnv: "PAY_ADDR_BTC" },
  ETH: { chain: "ethereum", type: "account", decimals: 18, addressEnv: "PAY_ADDR_ETH" },
  LTC: { chain: "litecoin", type: "utxo", decimals: 8, addressEnv: "PAY_ADDR_LTC" },
  DOGE: { chain: "dogecoin", type: "utxo", decimals: 8, addressEnv: "PAY_ADDR_DOGE" },
  USDT: {
    chain: "ethereum",
    type: "erc20",
    decimals: 6,
    addressEnv: "PAY_ADDR_USDT",
    tokenEnv: "PAY_TOKEN_USDT",
    tokenDefault: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  USDC: {
    chain: "ethereum",
    type: "erc20",
    decimals: 6,
    addressEnv: "PAY_ADDR_USDC",
    tokenEnv: "PAY_TOKEN_USDC",
    tokenDefault: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
};

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeLower = (value) => normalizeString(value).toLowerCase();

const withApiKey = (url) => {
  const key = normalizeString(process.env.BLOCKCHAIR_API_KEY);
  if (!key) return url;
  return url.includes("?") ? `${url}&key=${encodeURIComponent(key)}` : `${url}?key=${encodeURIComponent(key)}`;
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    const message = payload?.error ?? `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
};

const fetchJsonSafe = async (url) => {
  try {
    return await fetchJson(url);
  } catch {
    return null;
  }
};

const toBaseUnits = (amount, decimals) => {
  const raw = String(amount ?? "").trim();
  if (!raw) return null;
  const [whole, fraction = ""] = raw.split(".");
  const cleanWhole = whole.replace(/\D/g, "") || "0";
  const cleanFraction = fraction.replace(/\D/g, "");
  const paddedFraction = (cleanFraction + "0".repeat(decimals)).slice(0, decimals);
  try {
    return BigInt(`${cleanWhole}${paddedFraction}`);
  } catch {
    return null;
  }
};

const valueToBigInt = (value) => {
  if (value === undefined || value === null) return null;
  try {
    return BigInt(String(value));
  } catch {
    return null;
  }
};

const getLatestBlock = (context) => {
  const state = context?.state ?? {};
  const candidate = state.blocks ?? state.block_count ?? state.best_block_height ?? state.blocks_count;
  const value = Number(candidate);
  return Number.isFinite(value) ? value : null;
};

const getConfirmations = (transaction, context) => {
  const direct = Number(transaction?.confirmations);
  if (Number.isFinite(direct)) return direct;
  const blockId = Number(transaction?.block_id);
  const latest = getLatestBlock(context);
  if (Number.isFinite(blockId) && Number.isFinite(latest) && latest >= blockId) {
    return latest - blockId + 1;
  }
  return blockId ? 1 : 0;
};

const extractTxTime = (transaction) => {
  return transaction?.time ?? transaction?.block_time ?? transaction?.date ?? null;
};

const parseOrderDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isAfterOrderDate = (txTime, orderDate) => {
  if (!txTime || !orderDate) return true;
  const parsed = new Date(txTime);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed.getTime() >= orderDate.getTime();
};

const getAddressData = (payload, address) => {
  if (!payload?.data) return null;
  return payload.data[address] || payload.data[address.toLowerCase()] || payload.data[address.toUpperCase()] || null;
};

const getTxData = (payload, txid) => {
  if (!payload?.data) return null;
  return payload.data[txid] || payload.data[txid.toLowerCase()] || payload.data[txid.toUpperCase()] || null;
};

const getOutputs = (txData) => {
  if (!txData) return [];
  if (Array.isArray(txData.outputs)) return txData.outputs;
  if (Array.isArray(txData.outputs_data)) return txData.outputs_data;
  if (Array.isArray(txData.transaction_outputs)) return txData.transaction_outputs;
  return [];
};

const getTransfers = (txData) => {
  if (!txData) return [];
  if (Array.isArray(txData.token_transfers)) return txData.token_transfers;
  if (Array.isArray(txData.erc_20_transfers)) return txData.erc_20_transfers;
  if (Array.isArray(txData.erc20_transfers)) return txData.erc20_transfers;
  return [];
};

const matchOutput = (outputs, address, expected) => {
  for (const output of outputs) {
    const recipient = normalizeString(output?.recipient ?? output?.address ?? output?.to);
    if (!recipient || recipient !== address) continue;
    const value = valueToBigInt(output?.value ?? output?.amount);
    if (value !== null && expected !== null && value === expected) {
      return true;
    }
  }
  return false;
};

const matchEthTransfer = (transaction, address, expected) => {
  const recipient = normalizeLower(transaction?.recipient ?? transaction?.to ?? transaction?.receiver);
  if (!recipient || recipient !== normalizeLower(address)) return false;
  const value = valueToBigInt(transaction?.value ?? transaction?.amount ?? transaction?.token_value);
  return value !== null && expected !== null && value === expected;
};

const matchTokenTransfer = (transfers, address, tokenAddress, expected) => {
  const normalizedToken = normalizeLower(tokenAddress);
  const normalizedRecipient = normalizeLower(address);
  for (const transfer of transfers) {
    const recipient = normalizeLower(transfer?.recipient ?? transfer?.to ?? transfer?.receiver);
    const token = normalizeLower(transfer?.token_address ?? transfer?.token ?? transfer?.contract_address);
    if (!recipient || !token || recipient !== normalizedRecipient || token !== normalizedToken) continue;
    const value = valueToBigInt(transfer?.value ?? transfer?.amount ?? transfer?.token_value ?? transfer?.quantity);
    if (value !== null && expected !== null && value === expected) {
      return true;
    }
  }
  return false;
};

const checkUtxoPayment = async ({ chain, address, expected, orderDate }) => {
  const addressPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/${chain}/dashboards/address/${address}`));
  const addressData = getAddressData(addressPayload, address);
  const txids = Array.isArray(addressData?.transactions) ? addressData.transactions.slice(0, MAX_TX_CHECK) : [];

  for (const txid of txids) {
    const txPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/${chain}/dashboards/transaction/${txid}`));
    const txData = getTxData(txPayload, txid);
    const outputs = getOutputs(txData);
    const transaction = txData?.transaction ?? {};
    if (!matchOutput(outputs, address, expected)) continue;
    if (!isAfterOrderDate(extractTxTime(transaction), orderDate)) continue;

    const confirmations = getConfirmations(transaction, txPayload.context);
    return {
      status: confirmations > 0 ? "pending" : "unpaid",
      confirmations,
      txid,
      detectedAt: extractTxTime(transaction) ?? new Date().toISOString(),
    };
  }

  return { status: "unpaid", confirmations: 0 };
};

const checkAccountPayment = async ({ chain, address, expected, orderDate }) => {
  const addressPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/${chain}/dashboards/address/${address}`));
  const addressData = getAddressData(addressPayload, address);
  const txids = Array.isArray(addressData?.transactions) ? addressData.transactions.slice(0, MAX_TX_CHECK) : [];

  for (const txid of txids) {
    const txPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/${chain}/dashboards/transaction/${txid}`));
    const txData = getTxData(txPayload, txid);
    const transaction = txData?.transaction ?? {};
    if (!matchEthTransfer(transaction, address, expected)) continue;
    if (!isAfterOrderDate(extractTxTime(transaction), orderDate)) continue;

    const confirmations = getConfirmations(transaction, txPayload.context);
    return {
      status: confirmations > 0 ? "pending" : "unpaid",
      confirmations,
      txid,
      detectedAt: extractTxTime(transaction) ?? new Date().toISOString(),
    };
  }

  return { status: "unpaid", confirmations: 0 };
};

const checkErc20Payment = async ({ address, expected, orderDate, tokenAddress }) => {
  const queryUrl = withApiKey(
    `${BLOCKCHAIR_BASE}/ethereum/erc-20/transactions?q=recipient(${address}),token_address(${tokenAddress})&limit=${MAX_TX_CHECK}`
  );
  const queryPayload = await fetchJsonSafe(queryUrl);

  const rows = Array.isArray(queryPayload?.data)
    ? queryPayload.data
    : Array.isArray(queryPayload?.data?.rows)
      ? queryPayload.data.rows
      : Array.isArray(queryPayload?.rows)
        ? queryPayload.rows
        : [];

  for (const row of rows) {
    const value = valueToBigInt(row?.value ?? row?.amount ?? row?.token_value ?? row?.quantity);
    if (value === null || expected === null || value !== expected) continue;
    const txid = normalizeString(row?.transaction_hash ?? row?.transaction_id ?? row?.transaction);
    const txTime = row?.time ?? row?.block_time ?? row?.date ?? null;
    if (!isAfterOrderDate(txTime, orderDate)) continue;
    const confirmations = Number(row?.confirmations ?? 0) || 0;
    return {
      status: confirmations > 0 ? "pending" : "unpaid",
      confirmations,
      txid,
      detectedAt: txTime ?? new Date().toISOString(),
    };
  }

  // Fallback: scan address transactions for token transfers
  const addressPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/ethereum/dashboards/address/${address}`));
  const addressData = getAddressData(addressPayload, address);
  const txids = Array.isArray(addressData?.transactions) ? addressData.transactions.slice(0, MAX_TX_CHECK) : [];

  for (const txid of txids) {
    const txPayload = await fetchJson(withApiKey(`${BLOCKCHAIR_BASE}/ethereum/dashboards/transaction/${txid}`));
    const txData = getTxData(txPayload, txid);
    const transfers = getTransfers(txData);
    const transaction = txData?.transaction ?? {};
    if (!matchTokenTransfer(transfers, address, tokenAddress, expected)) continue;
    if (!isAfterOrderDate(extractTxTime(transaction), orderDate)) continue;

    const confirmations = getConfirmations(transaction, txPayload.context);
    return {
      status: confirmations > 0 ? "pending" : "unpaid",
      confirmations,
      txid,
      detectedAt: extractTxTime(transaction) ?? new Date().toISOString(),
    };
  }

  return { status: "unpaid", confirmations: 0 };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const { coin, amount, address: clientAddress, orderDate, confirmationsRequired } = req.body || {};
    const normalizedCoin = normalizeString(coin).toUpperCase();
    const config = COIN_CONFIG[normalizedCoin];
    if (!config) {
      res.status(400).json({ ok: false, error: "Unsupported coin." });
      return;
    }

    const address = normalizeString(process.env[config.addressEnv] || clientAddress);
    if (!address) {
      res.status(400).json({ ok: false, error: "Payment address is not configured." });
      return;
    }

    const expected = toBaseUnits(amount, config.decimals);
    if (expected === null) {
      res.status(400).json({ ok: false, error: "Invalid payment amount." });
      return;
    }

    const required = Math.max(1, Number(confirmationsRequired) || 1);
    const parsedOrderDate = parseOrderDate(orderDate);

    let result;
    if (config.type === "utxo") {
      result = await checkUtxoPayment({ chain: config.chain, address, expected, orderDate: parsedOrderDate });
    } else if (config.type === "account") {
      result = await checkAccountPayment({ chain: config.chain, address, expected, orderDate: parsedOrderDate });
    } else {
      const tokenAddress = normalizeString(process.env[config.tokenEnv] || config.tokenDefault);
      result = await checkErc20Payment({ address, expected, orderDate: parsedOrderDate, tokenAddress });
    }

    const status = result.status === "pending" && result.confirmations >= required ? "confirmed" : result.status;

    res.status(200).json({
      ok: true,
      data: {
        status,
        confirmations: result.confirmations ?? 0,
        txid: result.txid,
        detectedAt: result.detectedAt,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
