import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { HashChip } from '../components/common/HashChip';
import { AddressChip } from '../components/common/AddressChip';
import { TxRow } from '../components/common/TxRow';
import { fetchBlockByHeight, fetchBlockTransactions } from '../api/rest';
import { formatDate, formatQort } from '../utils/format';
import type { BlockData, TxData } from '../types';

const TX_LIMIT = 20;

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: `1px solid ${c.borderLight}`, '&:last-child': { borderBottom: 'none' }, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: tokens.typography.weightBold, color: c.textSecondary, minWidth: 120, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em', pt: '2px' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

function FieldText({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Typography sx={{ fontSize: '0.85rem', color: c.textPrimary }}>{children}</Typography>;
}

export function BlockPage() {
  const { height } = useParams<{ height: string }>();
  const navigate = useNavigate();
  const c = useColors();

  const [block, setBlock]     = useState<BlockData | null>(null);
  const [txs, setTxs]         = useState<TxData[]>([]);
  const [txOffset, setTxOffset] = useState(0);
  const [expandedSigs, setExpandedSigs] = useState<Set<string>>(new Set());
  function toggleExpand(sig: string) {
    setExpandedSigs(prev => { const s = new Set(prev); s.has(sig) ? s.delete(sig) : s.add(sig); return s; });
  }
  const [hasMoreTxs, setHasMore] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(true);
  const [loadingTxs, setLoadingTxs]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!height) return;
    setLoadingBlock(true);
    setError(null);
    setTxs([]);
    setTxOffset(0);

    fetchBlockByHeight(parseInt(height)).then(b => {
      setBlock(b);
      setLoadingBlock(false);
      if (b.transactionCount > 0) {
        setLoadingTxs(true);
        void fetchBlockTransactions(b.signature, TX_LIMIT, 0).then(results => {
          setTxs(results);
          setHasMore(results.length === TX_LIMIT);
          setTxOffset(results.length);
          setLoadingTxs(false);
        });
      }
    }).catch(e => {
      setError(e instanceof Error ? e.message : String(e));
      setLoadingBlock(false);
    });
  }, [height]);

  const loadMoreTxs = useCallback(async () => {
    if (!block) return;
    setLoadingMore(true);
    const results = await fetchBlockTransactions(block.signature, TX_LIMIT, txOffset);
    setTxs(prev => [...prev, ...results]);
    setHasMore(results.length === TX_LIMIT);
    setTxOffset(o => o + results.length);
    setLoadingMore(false);
  }, [block, txOffset]);

  if (loadingBlock) {
    return (
      <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} sx={{ color: c.accent }} />
      </Box>
    );
  }

  if (error || !block) {
    return (
      <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        <Typography sx={{ color: c.error, fontSize: '0.85rem' }}>{error ?? 'Block not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      {/* Back + title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button onClick={() => navigate('/blocks')} size="small" startIcon={<ArrowBackIcon />}
          sx={{ color: c.textSecondary, fontWeight: tokens.typography.weightBold, fontSize: '0.72rem', minWidth: 0, p: 0, '&:hover': { color: c.accent, bgcolor: 'transparent' } }}>
          Blocks
        </Button>
      </Box>

      <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary }}>Block</Typography>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary, letterSpacing: '-0.02em' }}>
          #{block.height.toLocaleString()}
        </Typography>
      </Box>

      {/* Block detail card */}
      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, px: 2.5, py: 0.5, mb: 2 }}>
        <FieldRow label="Timestamp">
          <FieldText>{formatDate(block.timestamp)}</FieldText>
        </FieldRow>
        <FieldRow label="Signature">
          <HashChip hash={block.signature} full />
        </FieldRow>
        <FieldRow label="Minter">
          {block.minterAddress ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddressChip address={block.minterAddress} onClick={() => navigate(`/address/${block.minterAddress}`)} />
              {block.minterLevel != null && (
                <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, color: c.textSecondary }}>
                  Level {block.minterLevel}
                </Typography>
              )}
            </Box>
          ) : (
            <HashChip hash={block.minterPublicKey} />
          )}
        </FieldRow>
        <FieldRow label="Transactions"><FieldText>{block.transactionCount}</FieldText></FieldRow>
        <FieldRow label="Total Fees"><FieldText>{formatQort(block.totalFees)} QORT</FieldText></FieldRow>
        <FieldRow label="Online Accounts"><FieldText>{block.onlineAccountsCount.toLocaleString()}</FieldText></FieldRow>
        <FieldRow label="AT Count"><FieldText>{block.atCount}</FieldText></FieldRow>
        {block.atCount > 0 && <FieldRow label="AT Fees"><FieldText>{formatQort(block.atFees)} QORT</FieldText></FieldRow>}
        <FieldRow label="Version"><FieldText>{block.version}</FieldText></FieldRow>
      </Box>

      {/* Transactions */}
      {block.transactionCount > 0 && (
        <>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 1.5 }}>
            Transactions ({block.transactionCount})
          </Typography>
          <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden', mb: 2 }}>
            {loadingTxs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={20} sx={{ color: c.accent }} />
              </Box>
            ) : (
              txs.map(tx => <TxRow key={tx.signature} tx={tx} expanded={expandedSigs.has(tx.signature)} onToggle={() => toggleExpand(tx.signature)} />)
            )}
          </Box>

          {hasMoreTxs && !loadingTxs && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => { void loadMoreTxs(); }} disabled={loadingMore}
                sx={{ borderColor: c.accent, color: c.accent, borderRadius: '50px', fontSize: '0.75rem', px: 3, '&:hover': { bgcolor: c.borderLight }, '&.Mui-disabled': { opacity: 0.35 } }}>
                {loadingMore ? <CircularProgress size={14} sx={{ color: c.accent }} /> : 'Load more'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
