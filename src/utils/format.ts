export function parseAmount(val: string | number | undefined | null): number {
  if (val == null || val === '') return 0;
  return typeof val === 'number' ? val : parseFloat(val);
}

export function formatQort(val: string | number | undefined | null): string {
  const n = parseAmount(val);
  if (n === 0) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

export function truncHash(hash: string | undefined | null, head = 8, tail = 4): string {
  if (!hash) return '—';
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function truncAddr(addr: string | undefined | null): string {
  return truncHash(addr, 8, 4);
}

export function formatAge(ts: number | undefined | null): string {
  if (!ts) return '—';
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function formatDate(ts: number | undefined | null): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

const TX_LABELS: Record<string, string> = {
  PAYMENT:                   'Payment',
  REGISTER_NAME:             'Register Name',
  UPDATE_NAME:               'Update Name',
  SELL_NAME:                 'Sell Name',
  CANCEL_SELL_NAME:          'Cancel Sale',
  BUY_NAME:                  'Buy Name',
  TRANSFER_ASSET:            'Transfer Asset',
  ISSUE_ASSET:               'Issue Asset',
  CREATE_ASSET_ORDER:        'Asset Order',
  CANCEL_ASSET_ORDER:        'Cancel Order',
  UPDATE_ASSET:              'Update Asset',
  SELL_ASSET_OWNERSHIP:      'Sell Asset',
  CANCEL_SELL_ASSET_OWNERSHIP: 'Cancel Asset Sale',
  BUY_ASSET_OWNERSHIP:       'Buy Asset',
  MULTI_PAYMENT:             'Multi-Payment',
  REWARD_SHARE:              'Reward Share',
  TRANSFER_PRIVS:            'Transfer Privs',
  DEPLOY_AT:                 'Deploy AT',
  ARBITRARY:                 'Arbitrary',
  PUBLICIZE:                 'Publicize',
  CREATE_POLL:               'Create Poll',
  VOTE_ON_POLL:              'Vote',
  UPDATE_POLL:               'Update Poll',
  CREATE_GROUP:              'Create Group',
  UPDATE_GROUP:              'Update Group',
  ADD_GROUP_ADMIN:           'Add Admin',
  REMOVE_GROUP_ADMIN:        'Remove Admin',
  GROUP_BAN:                 'Group Ban',
  CANCEL_GROUP_BAN:          'Cancel Ban',
  GROUP_KICK:                'Group Kick',
  GROUP_INVITE:              'Group Invite',
  CANCEL_GROUP_INVITE:       'Cancel Invite',
  JOIN_GROUP:                'Join Group',
  LEAVE_GROUP:               'Leave Group',
  GROUP_APPROVAL:            'Group Approval',
  SET_GROUP:                 'Set Group',
  RATE_ACCOUNT:              'Rate Account',
};

export function txTypeLabel(type: string): string {
  const t = typeof type === 'string' ? type : String(type);
  return TX_LABELS[t] ?? t.replace(/_/g, ' ');
}

export type TxCategory = 'transfer' | 'name' | 'asset' | 'group' | 'system';

export const TX_TYPES = Object.keys(TX_LABELS);

const SERVICE_LABELS: Record<string, string> = {
  APP:                        'App',
  WEBSITE:                    'Website',
  DOCUMENT:                   'Document',
  DOCUMENT_PRIVATE:           'Private Doc',
  BLOG_POST:                  'Blog Post',
  BLOG_COMMENT:               'Blog Comment',
  COMMENT:                    'Comment',
  IMAGE:                      'Image',
  IMAGE_PRIVATE:              'Private Image',
  THUMBNAIL:                  'Thumbnail',
  VIDEO:                      'Video',
  VIDEO_PRIVATE:              'Private Video',
  AUDIO:                      'Audio',
  AUDIO_PRIVATE:              'Private Audio',
  VOICE:                      'Voice',
  VOICE_PRIVATE:              'Private Voice',
  ATTACHMENT:                 'Attachment',
  ATTACHMENT_PRIVATE:         'Private Attachment',
  JSON:                       'JSON',
  GIF_REPOSITORY:             'GIF Repo',
  STORE:                      'Store',
  PRODUCT:                    'Product',
  LIST:                       'List',
  METADATA:                   'Metadata',
  PLAYLIST:                   'Playlist',
  GAME:                       'Game',
  AVATAR:                     'Avatar',
  MAIL:                       'Mail',
  MAIL_PRIVATE:               'Private Mail',
  MESSAGE:                    'Message',
  MESSAGE_PRIVATE:            'Private Message',
  QCHAT_IMAGE:                'QChat Image',
  QCHAT_AUDIO:                'QChat Audio',
  QCHAT_VOICE:                'QChat Voice',
  QCHAT_ATTACHMENT:           'QChat File',
  QCHAT_ATTACHMENT_PRIVATE:   'QChat Private File',
  CHAIN_DATA:                 'Chain Data',
  CHAIN_COMMENT:              'Chain Comment',
};

export function serviceLabel(service: string): string {
  const s = typeof service === 'string' ? service : String(service);
  return SERVICE_LABELS[s] ?? s.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

export function txTypeCategory(type: string): TxCategory {
  const t = typeof type === 'string' ? type : String(type);
  if (['PAYMENT', 'TRANSFER_ASSET', 'MULTI_PAYMENT'].includes(t)) return 'transfer';
  if (t.includes('NAME'))   return 'name';
  if (t.includes('ASSET') || t.includes('ORDER')) return 'asset';
  if (t.includes('GROUP') || t.includes('POLL') || t === 'VOTE_ON_POLL') return 'group';
  return 'system';
}
