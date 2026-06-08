export enum EnumTheme {
  DARK = 'dark',
  LIGHT = 'light',
}

export interface BlockSummary {
  height: number;
  signature: string;
  minterPublicKey: string;
  minterAddress?: string;
  minterLevel?: number;
  onlineAccountsCount?: number;
  timestamp?: number;
  transactionCount?: number;
}

export interface BlockData extends BlockSummary {
  version: number;
  reference: string;
  transactionCount: number;
  totalFees: string;
  transactionsSignature: string;
  minterSignature: string;
  atCount: number;
  atFees: string;
  onlineAccountsCount: number;
  onlineAccountsTimestamp?: number;
}

export interface TxData {
  type: string;
  signature: string;
  timestamp: number;
  fee?: string;
  creatorPublicKey?: string;
  blockHeight?: number;
  blockSequence?: number;
  recipient?: string;
  txGroupId?: number;
  approvalStatus?: string;
  // financial
  amount?: string;
  senderPublicKey?: string;
  assetId?: number;
  assetName?: string;
  // names
  name?: string;
  seller?: string;
  data?: string;
  // sender
  creatorAddress?: string;
  // arbitrary
  service?: string;
  identifier?: string;
  size?: number;
}

export interface AccountInfo {
  address: string;
  publicKey?: string;
  level: number;
  blocksMinted: number;
  trustStatus?: string;
}

export interface OnlineAccountLevel {
  level: number;
  count: number;
}

export interface PeersSummary {
  inboundConnections: number;
  outboundConnections: number;
}
