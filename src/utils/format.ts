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
  GENESIS:                     'Genesis',
  PAYMENT:                     'Payment',
  MULTI_PAYMENT:               'Multi-Payment',
  REGISTER_NAME:               'Register Name',
  UPDATE_NAME:                 'Update Name',
  SELL_NAME:                   'Sell Name',
  CANCEL_SELL_NAME:            'Cancel Sale',
  BUY_NAME:                    'Buy Name',
  ISSUE_ASSET:                 'Issue Asset',
  TRANSFER_ASSET:              'Transfer Asset',
  CREATE_ASSET_ORDER:          'Asset Order',
  CANCEL_ASSET_ORDER:          'Cancel Order',
  UPDATE_ASSET:                'Update Asset',
  SELL_ASSET_OWNERSHIP:        'Sell Asset',
  CANCEL_SELL_ASSET_OWNERSHIP: 'Cancel Asset Sale',
  BUY_ASSET_OWNERSHIP:         'Buy Asset',
  CREATE_POLL:                 'Create Poll',
  VOTE_ON_POLL:                'Vote',
  UPDATE_POLL:                 'Update Poll',
  ARBITRARY:                   'Arbitrary',
  MESSAGE:                     'Message',
  CHAT:                        'Chat',
  CREATE_GROUP:                'Create Group',
  UPDATE_GROUP:                'Update Group',
  ADD_GROUP_ADMIN:             'Add Admin',
  REMOVE_GROUP_ADMIN:          'Remove Admin',
  GROUP_BAN:                   'Group Ban',
  CANCEL_GROUP_BAN:            'Cancel Ban',
  GROUP_KICK:                  'Group Kick',
  GROUP_INVITE:                'Group Invite',
  CANCEL_GROUP_INVITE:         'Cancel Invite',
  JOIN_GROUP:                  'Join Group',
  LEAVE_GROUP:                 'Leave Group',
  GROUP_APPROVAL:              'Group Approval',
  SET_GROUP:                   'Set Group',
  REWARD_SHARE:                'Reward Share',
  TRANSFER_PRIVS:              'Transfer Privs',
  DEPLOY_AT:                   'Deploy AT',
  AT:                          'AT Execution',
  PUBLICIZE:                   'Publicize',
  PRESENCE:                    'Presence',
  RATE_RESOURCE:               'Rate Resource',
  RATE_ACCOUNT:                'Rate Account',
  CHAIN_PARAMETER_UPDATE:      'Chain Parameter Update',
};

export function txTypeLabel(type: string): string {
  const t = typeof type === 'string' ? type : String(type);
  return TX_LABELS[t] ?? t.replace(/_/g, ' ');
}

export type TxCategory = 'transfer' | 'name' | 'asset' | 'group' | 'system';

export const TX_TYPES = Object.keys(TX_LABELS);

const SERVICE_LABELS: Record<string, string> = {
  // system / internal
  AUTO_UPDATE:                 'Auto Update',
  AUTO_UPDATE_BINARY:          'Auto Update Binary',
  ARBITRARY_DATA:              'Arbitrary Data',
  // QChat
  QCHAT_ATTACHMENT:            'QChat File',
  QCHAT_ATTACHMENT_PRIVATE:    'QChat Private File',
  QCHAT_IMAGE:                 'QChat Image',
  QCHAT_AUDIO:                 'QChat Audio',
  QCHAT_VOICE:                 'QChat Voice',
  // attachments / files
  ATTACHMENT:                  'Attachment',
  ATTACHMENT_PRIVATE:          'Private Attachment',
  FILE:                        'File',
  FILE_PRIVATE:                'Private File',
  FILES:                       'Files',
  FILES_PRIVATE:               'Private Files',
  CHAIN_DATA:                  'Chain Data',
  // web
  WEBSITE:                     'Website',
  WEBSITE_PRIVATE:             'Private Website',
  // VCS
  GIT_REPOSITORY:              'Git Repository',
  GIT_REPOSITORY_PRIVATE:      'Private Git Repo',
  // images
  IMAGE:                       'Image',
  IMAGE_PRIVATE:               'Private Image',
  THUMBNAIL:                   'Thumbnail',
  IMAGE_GALLERY:               'Image Gallery',
  IMAGE_GALLERY_PRIVATE:       'Private Gallery',
  // video
  VIDEO:                       'Video',
  VIDEO_PRIVATE:               'Private Video',
  // audio
  AUDIO:                       'Audio',
  AUDIO_PRIVATE:               'Private Audio',
  VOICE:                       'Voice',
  VOICE_PRIVATE:               'Private Voice',
  PODCAST:                     'Podcast',
  // blog
  BLOG:                        'Blog',
  BLOG_PRIVATE:                'Private Blog',
  BLOG_POST:                   'Blog Post',
  BLOG_COMMENT:                'Blog Comment',
  // documents
  DOCUMENT:                    'Document',
  DOCUMENT_PRIVATE:            'Private Doc',
  // collections
  LIST:                        'List',
  PLAYLIST:                    'Playlist',
  // apps
  APP:                         'App',
  APP_PRIVATE:                 'Private App',
  // structured data
  METADATA:                    'Metadata',
  JSON:                        'JSON',
  // GIFs
  GIF_REPOSITORY:              'GIF Repo',
  // commerce
  STORE:                       'Store',
  PRODUCT:                     'Product',
  OFFER:                       'Offer',
  COUPON:                      'Coupon',
  // code
  CODE:                        'Code',
  PLUGIN:                      'Plugin',
  EXTENSION:                   'Extension',
  // games
  GAME:                        'Game',
  ITEM:                        'Item',
  // NFT
  NFT:                         'NFT',
  // databases
  DATABASE:                    'Database',
  DATABASE_PRIVATE:            'Private Database',
  SNAPSHOT:                    'Snapshot',
  SNAPSHOT_PRIVATE:            'Private Snapshot',
  // social / messaging
  COMMENT:                     'Comment',
  CHAIN_COMMENT:               'Chain Comment',
  MAIL:                        'Mail',
  MAIL_PRIVATE:                'Private Mail',
  MESSAGE:                     'Message',
  MESSAGE_PRIVATE:             'Private Message',
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

export const SERVICE_TYPES = Object.keys(SERVICE_LABELS);
