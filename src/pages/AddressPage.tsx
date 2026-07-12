import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Chip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { HashChip } from '../components/common/HashChip';
import { TxRow } from '../components/common/TxRow';
import { fetchAccount, fetchBalance, fetchPrimaryName, fetchTransactionsByAddress } from '../api/rest';
import { formatQort } from '../utils/format';
import type { AccountInfo, TxData } from '../types';

const TX_LIMIT = 20;

export function AddressPage() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reverse = searchParams.get('reverse') !== 'false';
  const c = useColors();

  const [account, setAccount]     = useState<AccountInfo | null>(null);
  const [balance, setBalance]     = useState<string>('—');
  const [name, setName]           = useState<string | null>(null);
  const [txs, setTxs]             = useState<TxData[]>([]);
  const [expandedSigs, setExpandedSigs] = useState<Set<string>>(new Set());
  function toggleExpand(sig: string) {
    setExpandedSigs(prev => { const s = new Set(prev); s.has(sig) ? s.delete(sig) : s.add(sig); return s; });
  }
  const [txOffset, setTxOffset]   = useState(0);
  const [hasMore, setHasMore]     = useState(false);
  const [loadingHead, setLoadingHead] = useState(true);
  const [loadingTxs, setLoadingTxs]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoadingHead(true);
    setLoadingTxs(true);
    setError(null);
    setTxs([]);
    setTxOffset(0);

    void Promise.all([
      fetchAccount(address),
      fetchBalance(address),
      fetchPrimaryName(address),
    ]).then(([acc, bal, n]) => {
      setAccount(acc);
      setBalance(bal);
      setName(n);
      setLoadingHead(false);
    }).catch(e => {
      setError(e instanceof Error ? e.message : String(e));
      setLoadingHead(false);
    });

    void fetchTransactionsByAddress(address, TX_LIMIT, 0, reverse).then(results => {
      setTxs(results);
      setHasMore(results.length === TX_LIMIT);
      setTxOffset(results.length);
      setLoadingTxs(false);
    });
  }, [address, reverse]);

  const loadMore = useCallback(async () => {
    if (!address) return;
    setLoadingMore(true);
    const results = await fetchTransactionsByAddress(address, TX_LIMIT, txOffset, reverse);
    setTxs(prev => [...prev, ...results]);
    setHasMore(results.length === TX_LIMIT);
    setTxOffset(o => o + results.length);
    setLoadingMore(false);
  }, [address, txOffset, reverse]);

  if (loadingHead && !error) {
    return (
      <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} sx={{ color: c.accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        <Typography sx={{ color: c.error, fontSize: '0.85rem' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button onClick={() => navigate(-1)} size="small" startIcon={<ArrowBackIcon />}
          sx={{ color: c.textSecondary, fontWeight: tokens.typography.weightBold, fontSize: '0.72rem', minWidth: 0, p: 0, '&:hover': { color: c.accent, bgcolor: 'transparent' } }}>
          Back
        </Button>
      </Box>

      {/* Address header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary }}>
            Address
          </Typography>
          {name && (
            <Chip label={name} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${c.accent}22`, color: c.accent, border: `1px solid ${c.accent}44` }} />
          )}
        </Box>
        <HashChip hash={address ?? ''} full />
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Balance</Typography>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary, letterSpacing: '-0.02em' }}>
            {balance === '—' ? '—' : `${formatQort(balance)} QORT`}
          </Typography>
        </Box>
        {account && (
          <>
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Level</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary }}>{account.level}</Typography>
            </Box>
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Blocks Minted</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary }}>{account.blocksMinted.toLocaleString()}</Typography>
            </Box>
            {account.trustStatus && (
              <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Trust</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: tokens.typography.weightBold, color: c.textPrimary }}>{account.trustStatus}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Transaction history */}
      <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 1.5 }}>
        Transaction History
      </Typography>

      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden', mb: 2 }}>
        {loadingTxs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={20} sx={{ color: c.accent }} />
          </Box>
        ) : txs.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary }}>No transactions found.</Typography>
          </Box>
        ) : (
          txs.map(tx => <TxRow key={tx.signature} tx={tx} expanded={expandedSigs.has(tx.signature)} onToggle={() => toggleExpand(tx.signature)} />)
        )}
      </Box>

      {hasMore && !loadingTxs && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => { void loadMore(); }} disabled={loadingMore}
            sx={{ borderColor: c.accent, color: c.accent, borderRadius: '50px', fontSize: '0.75rem', px: 3, '&:hover': { bgcolor: c.borderLight }, '&.Mui-disabled': { opacity: 0.35 } }}>
            {loadingMore ? <CircularProgress size={14} sx={{ color: c.accent }} /> : 'Load more'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
