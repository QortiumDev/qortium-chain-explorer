import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { HashChip } from '../components/common/HashChip';
import {
  fetchLastBlock, fetchBlockSummaries, fetchCirculatingSupply,
  fetchPeersSummary, fetchOnlineLevels, fetchUnconfirmedTxs,
} from '../api/rest';
import { formatAge, parseAmount } from '../utils/format';
import type { BlockSummary, TxData } from '../types';

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  const c = useColors();
  return (
    <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.3rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary, mt: 0.5 }}>{sub}</Typography>}
    </Box>
  );
}

function BlockRow({ block }: { block: BlockSummary }) {
  const c = useColors();
  const navigate = useNavigate();
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      px: 2.5, py: 1.5,
      borderBottom: `1px solid ${c.borderLight}`,
      '&:last-child': { borderBottom: 'none' },
      '&:hover': { bgcolor: c.borderLight },
      transition: '0.12s ease', cursor: 'pointer',
    }}
      onClick={() => navigate(`/block/${block.height}`)}
    >
      <Typography sx={{ fontSize: '0.9rem', fontWeight: tokens.typography.weightBold, color: c.accent, minWidth: 72, flexShrink: 0 }}>
        #{block.height.toLocaleString()}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {block.minterAddress && (
          <Box onClick={(e: MouseEvent) => e.stopPropagation()} sx={{ display: 'inline-flex' }}>
            <HashChip
              hash={block.minterAddress}
              onClick={() => navigate(`/address/${block.minterAddress}`)}
            />
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.75rem', color: c.textSecondary, flexShrink: 0, minWidth: 40, textAlign: 'center' }}>
        {block.transactionCount ?? 0} tx
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: c.textSecondary, flexShrink: 0, minWidth: 56, textAlign: 'center' }}>
        {block.onlineAccountsCount ?? '—'} online
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: c.textSecondary, flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
        {formatAge(block.timestamp)}
      </Typography>
    </Box>
  );
}

export function BlocksPage() {
  const c = useColors();
  const heightRef = useRef<number | null>(null);

  const [blocks, setBlocks]         = useState<BlockSummary[]>([]);
  const [supply, setSupply]         = useState<string>('—');
  const [peers, setPeers]           = useState<number>(0);
  const [onlineCount, setOnline]    = useState<number>(0);
  const [mempool, setMempool]       = useState<TxData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function loadSummaries() {
    const summaries = await fetchBlockSummaries(20).catch(() => []);
    setBlocks([...summaries].reverse());
    if (summaries.length > 0) {
      heightRef.current = summaries[summaries.length - 1].height;
    }
    setLastRefresh(new Date());
  }

  async function loadAll() {
    setLoading(true);
    const [, sup, ps, levels, unconf] = await Promise.all([
      loadSummaries(),
      fetchCirculatingSupply(),
      fetchPeersSummary(),
      fetchOnlineLevels(),
      fetchUnconfirmedTxs(10),
    ]);
    setSupply(sup);
    setPeers(ps.inboundConnections + ps.outboundConnections);
    setOnline(levels.filter(l => l.level > 0).reduce((a, b) => a + b.count, 0));
    setMempool(unconf);
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();

    const interval = setInterval(async () => {
      const tip = await fetchLastBlock().catch(() => null);
      if (tip && tip.height !== heightRef.current) {
        void loadSummaries();
      }
    }, 15000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const height = blocks[0]?.height ?? '—';

  return (
    <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: tokens.typography.weightBold, color: c.textPrimary }}>Block Explorer</Typography>
        {lastRefresh && (
          <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary, mt: 0.25 }}>
            Updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 15s
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <StatTile label="Block Height" value={typeof height === 'number' ? height.toLocaleString() : height} />
        <StatTile label="Circulating Supply" value={supply === '—' ? '—' : `${parseAmount(supply).toLocaleString()} QORT`} />
        <StatTile label="Connected Peers" value={peers} />
        <StatTile label="Online Minters" value={onlineCount} />
        <StatTile label="Mempool" value={mempool.length} sub={mempool.length === 10 ? '10+ unconfirmed' : `${mempool.length} unconfirmed`} />
      </Box>

      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${c.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary }}>
            Recent Blocks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, color: c.textSecondary, fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ minWidth: 40, textAlign: 'center' }}>Txs</span>
            <span style={{ minWidth: 56, textAlign: 'center' }}>Online</span>
            <span style={{ minWidth: 60, textAlign: 'right' }}>Age</span>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={24} sx={{ color: c.accent }} />
          </Box>
        ) : blocks.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary }}>No block data available.</Typography>
          </Box>
        ) : (
          blocks.map(b => <BlockRow key={b.height} block={b} />)
        )}
      </Box>
    </Box>
  );
}
