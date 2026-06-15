import type { BlockData, BlockSummary, TxData, AccountInfo, OnlineAccountLevel, PeersSummary } from '../types';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// Blocks

export async function fetchLastBlock(): Promise<BlockData> {
  return get<BlockData>('/blocks/last');
}

export async function fetchBlockSummaries(count = 20): Promise<BlockSummary[]> {
  return get<BlockSummary[]>(`/blocks/summaries?count=${count}`);
}

export async function fetchBlockByHeight(height: number): Promise<BlockData> {
  return get<BlockData>(`/blocks/byheight/${height}`);
}

export async function fetchBlockTransactions(signature: string, limit = 20, offset = 0): Promise<TxData[]> {
  try {
    return await get<TxData[]>(`/blocks/signature/${encodeURIComponent(signature)}/transactions?limit=${limit}&offset=${offset}`);
  } catch { return []; }
}

// Transactions

export async function fetchTransaction(signature: string): Promise<TxData> {
  return get<TxData>(`/transactions/signature/${encodeURIComponent(signature)}`);
}

export async function fetchTransactionsByAddress(address: string, limit = 20, offset = 0, reverse = true): Promise<TxData[]> {
  try {
    return await get<TxData[]>(`/transactions/address/${address}?limit=${limit}&offset=${offset}&reverse=${reverse}`);
  } catch { return []; }
}

export async function fetchUnconfirmedTxs(limit = 20): Promise<TxData[]> {
  try {
    return await get<TxData[]>(`/transactions/unconfirmed?limit=${limit}`);
  } catch { return []; }
}

// Addresses

export async function fetchAccount(address: string): Promise<AccountInfo> {
  return get<AccountInfo>(`/addresses/${address}`);
}

export async function fetchBalance(address: string): Promise<string> {
  try {
    const val = await get<string | number>(`/addresses/balance/${address}`);
    return String(val);
  } catch { return '0'; }
}

// Network

export async function fetchPeersSummary(): Promise<PeersSummary> {
  try {
    return await get<PeersSummary>('/peers/summary');
  } catch { return { inboundConnections: 0, outboundConnections: 0 }; }
}

export async function fetchCirculatingSupply(): Promise<string> {
  try {
    const val = await get<string | number>('/stats/supply/circulating');
    return String(val);
  } catch { return '0'; }
}

export async function fetchOnlineLevels(): Promise<OnlineAccountLevel[]> {
  try {
    return await get<OnlineAccountLevel[]>('/addresses/online/levels');
  } catch { return []; }
}

// Public key resolution

export async function fetchAddressForPublicKey(pubkey: string): Promise<string | null> {
  try {
    const result = await get<string | { address: string }>(`/addresses/convert/${pubkey}`);
    if (typeof result === 'string' && result.startsWith('Q')) return result;
    if (typeof result === 'object' && 'address' in result) return (result as { address: string }).address;
    return null;
  } catch { return null; }
}

// Transactions search

export interface TxSearchParams {
  address?: string;
  name?: string;
  txTypes?: string[];
  confirmationStatus?: 'CONFIRMED' | 'UNCONFIRMED' | 'BOTH';
  startBlock?: number;
  blockLimit?: number;
  txGroupId?: number;
  limit?: number;
  offset?: number;
  reverse?: boolean;
}

export async function searchTransactions(p: TxSearchParams): Promise<TxData[]> {
  const q = new URLSearchParams();
  if (p.address)              q.set('address', p.address);
  if (p.name)                 q.set('name', p.name);
  if (p.txTypes?.length)      p.txTypes.forEach(t => q.append('txType', t));
  q.set('confirmationStatus', p.confirmationStatus ?? 'CONFIRMED');
  if (p.startBlock != null)   q.set('startBlock',  String(p.startBlock));
  if (p.blockLimit != null)   q.set('blockLimit',  String(p.blockLimit));
  if (p.txGroupId != null)    q.set('txGroupId',   String(p.txGroupId));
  q.set('limit',  String(p.limit ?? 20));
  q.set('offset', String(p.offset ?? 0));
  q.set('reverse', p.reverse === false ? 'false' : 'true');
  try { return await get<TxData[]>(`/transactions/search?${q}`); }
  catch { return []; }
}

// Names

export async function fetchPrimaryName(address: string): Promise<string | null> {
  try {
    const result = await get<{ name: string | null; owner: string }>(`/names/primary/${address}`);
    return result.name ?? null;
  } catch { return null; }
}
