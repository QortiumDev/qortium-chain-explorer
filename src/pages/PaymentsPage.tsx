import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, CircularProgress, IconButton, InputBase, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { searchTransactions, fetchPrimaryName } from '../api/rest';
import { formatQort, formatAge, truncAddr } from '../utils/format';
import type { TxData } from '../types';

const LIMIT = 20;

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrailItem { address: string; name?: string; }

interface PaymentGroup {
  address: string;
  name?: string;
  totalAmount: number;
  txCount: number;
  lastTs: number;
}

interface Payments { received: PaymentGroup[]; sent: PaymentGroup[]; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGroups(txs: TxData[], address: string): Payments {
  const sentMap = new Map<string, PaymentGroup>();
  const rcvdMap = new Map<string, PaymentGroup>();
  for (const tx of txs) {
    const amt = tx.amount ? parseFloat(tx.amount) : 0;
    if (tx.recipient === address) {
      const from = tx.creatorAddress ?? '';
      if (!from) continue;
      const g = rcvdMap.get(from);
      if (g) { g.totalAmount += amt; g.txCount++; g.lastTs = Math.max(g.lastTs, tx.timestamp); }
      else    rcvdMap.set(from, { address: from, totalAmount: amt, txCount: 1, lastTs: tx.timestamp });
    } else {
      const to = tx.recipient ?? '';
      if (!to) continue;
      const g = sentMap.get(to);
      if (g) { g.totalAmount += amt; g.txCount++; g.lastTs = Math.max(g.lastTs, tx.timestamp); }
      else    sentMap.set(to, { address: to, totalAmount: amt, txCount: 1, lastTs: tx.timestamp });
    }
  }
  return {
    sent:     [...sentMap.values()].sort((a, b) => b.totalAmount - a.totalAmount),
    received: [...rcvdMap.values()].sort((a, b) => b.totalAmount - a.totalAmount),
  };
}

// ─── Row component ────────────────────────────────────────────────────────────

function GroupRow({ group, direction, onTrace }: {
  group: PaymentGroup;
  direction: 'received' | 'sent';
  onTrace: (addr: string, name?: string) => void;
}) {
  const c = useColors();
  return (
    <Box onClick={() => onTrace(group.address, group.name)} sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      px: 2.5, py: 1.5,
      borderBottom: `1px solid ${c.borderLight}`, '&:last-child': { borderBottom: 'none' },
      '&:hover': { bgcolor: c.borderLight }, transition: '0.12s ease', cursor: 'pointer',
    }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {group.name && (
          <Typography sx={{ fontSize: '0.78rem', fontWeight: tokens.typography.weightBold, color: c.textPrimary, mb: 0.15 }}>
            {group.name}
          </Typography>
        )}
        <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncAddr(group.address)}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.82rem', fontWeight: tokens.typography.weightBold, color: direction === 'received' ? c.success : c.textPrimary, flexShrink: 0 }}>
        {formatQort(group.totalAmount)} Q
      </Typography>
      {group.txCount > 1 && (
        <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary, flexShrink: 0 }}>×{group.txCount}</Typography>
      )}
      <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary, flexShrink: 0, minWidth: 52, textAlign: 'right' }}>
        {formatAge(group.lastTs)}
      </Typography>
      <ChevronRightIcon sx={{ fontSize: '1rem', color: c.textSecondary, flexShrink: 0 }} />
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PaymentsPage() {
  const c        = useColors();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchId   = useRef(0);
  const accTxs     = useRef<TxData[]>([]);

  const [input,         setInput]         = useState('');
  const [trail,         setTrail]         = useState<TrailItem[]>([]);
  const [payments,      setPayments]      = useState<Payments | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // ─── Deep link ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const addr = searchParams.get('address');
    if (addr) { setInput(addr); void goTo(addr); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Name resolution ────────────────────────────────────────────────────────

  function resolveNames(groups: Payments, address: string) {
    const addresses = [...new Set([
      ...groups.sent.map(g => g.address),
      ...groups.received.map(g => g.address),
      address,
    ])];
    for (const addr of addresses) {
      void fetchPrimaryName(addr).then(name => {
        if (!name) return;
        if (addr === address) setTrail(prev => prev.map(t => t.address === addr ? { ...t, name } : t));
        setPayments(prev => {
          if (!prev) return prev;
          const patch = (g: PaymentGroup) => g.address === addr ? { ...g, name } : g;
          return { sent: prev.sent.map(patch), received: prev.received.map(patch) };
        });
      });
    }
  }

  // ─── Fetch a single batch ────────────────────────────────────────────────────

  async function fetchBatch(address: string, fromOffset: number, myId: number) {
    const batch = await searchTransactions({
      address,
      txTypes: ['PAYMENT'],
      confirmationStatus: 'CONFIRMED',
      limit: LIMIT,
      offset: fromOffset,
      reverse: true,
    });

    if (myId !== searchId.current) return;

    accTxs.current = [...accTxs.current, ...batch];
    const groups   = buildGroups(accTxs.current, address);
    const newOffset = fromOffset + batch.length;

    setPayments(groups);

    if (fromOffset === 0) setLoading(false);

    if (batch.length === LIMIT) {
      void fetchBatch(address, newOffset, myId);
    } else {
      setAutoLoading(false);
      resolveNames(groups, address);
    }
  }

  // ─── Load payments (new address) ────────────────────────────────────────────

  function loadPayments(address: string) {
    const myId = ++searchId.current;
    setLoading(true);
    setAutoLoading(true);
    setError(null);
    setPayments(null);
    accTxs.current = [];
    void fetchBatch(address, 0, myId);
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────

  function goTo(address: string, name?: string) {
    setTrail(prev => [...prev, { address, name }]);
    loadPayments(address);
  }

  function jumpTo(index: number) {
    const item = trail[index];
    setTrail(prev => prev.slice(0, index + 1));
    loadPayments(item.address);
  }

  function handleSearch() {
    const addr = input.trim();
    if (!addr) return;
    setTrail([{ address: addr }]);
    loadPayments(addr);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const current = trail[trail.length - 1] ?? null;
  const hasData = payments !== null;

  const sectionLabel = (dir: 'received' | 'sent', count: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: dir === 'received' ? c.success : c.textSecondary }}>
        {dir === 'received' ? 'Received from' : 'Sent to'} · {count}{autoLoading ? '+' : ''}
      </Typography>
      {autoLoading && <CircularProgress size={10} sx={{ color: c.textSecondary, opacity: 0.5 }} />}
    </Box>
  );

  return (
    <Box sx={{ pt: `calc(var(--chain-top-bar-height, ${tokens.spacing.topBarHeight}px) + 24px)`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 980, mx: 'auto' }}>

      {/* Search */}
      <Box sx={{
        display: 'flex', gap: 1, alignItems: 'center',
        border: `${tokens.shape.borderWidth} solid ${c.borderLight}`,
        borderRadius: `${tokens.shape.radius}px`,
        bgcolor: c.surface, px: 1.5, height: 38, mb: 2,
        '&:focus-within': { borderColor: c.accent }, transition: '0.15s ease',
      }}>
        <SearchIcon sx={{ fontSize: '0.9rem', color: c.textSecondary }} />
        <InputBase fullWidth placeholder="Enter address to trace payments…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ fontSize: '0.82rem', color: c.textPrimary, '& input::placeholder': { color: c.textSecondary, opacity: 1 } }}
        />
        <Button size="small" onClick={handleSearch} disabled={loading || !input.trim()}
          sx={{ color: c.accent, fontSize: '0.78rem', minWidth: 0, flexShrink: 0, p: 0, '&:hover': { bgcolor: 'transparent', color: c.accentHover }, '&.Mui-disabled': { opacity: 0.35 } }}>
          Trace
        </Button>
      </Box>

      {/* Breadcrumb trail */}
      {trail.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.25, mb: 2.5, p: 1.5, bgcolor: c.surface, border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px` }}>
          {trail.map((item, i) => {
            const isCurrent = i === trail.length - 1;
            return (
              <Box key={`${item.address}-${i}`} sx={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <ChevronRightIcon sx={{ fontSize: '0.85rem', color: c.textSecondary, mx: 0.25 }} />}
                <Button size="small" disabled={isCurrent} onClick={() => jumpTo(i)}
                  sx={{
                    fontSize: '0.72rem', fontFamily: 'monospace', minWidth: 0, px: 0.75, py: 0.25,
                    color: isCurrent ? c.textPrimary : c.accent,
                    fontWeight: isCurrent ? tokens.typography.weightBold : tokens.typography.weightRegular,
                    '&.Mui-disabled': { color: c.textPrimary },
                    '&:hover': { bgcolor: 'transparent', color: c.accentHover },
                  }}>
                  {item.name ?? truncAddr(item.address)}
                </Button>
              </Box>
            );
          })}
          {current && (
            <Tooltip title="Open full address page">
              <IconButton size="small" onClick={() => navigate(`/address/${current.address}`)}
                sx={{ ml: 'auto', color: c.textSecondary, borderRadius: `${tokens.shape.radius - 2}px`, '&:hover': { color: c.accent } }}>
                <OpenInNewIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Initial spinner */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={24} sx={{ color: c.accent }} />
        </Box>
      )}

      {error && <Typography sx={{ fontSize: '0.85rem', color: c.error }}>{error}</Typography>}

      {/* Payment columns */}
      {hasData && !loading && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            {sectionLabel('received', payments.received.length)}
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden' }}>
              {payments.received.length === 0 ? (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: c.textSecondary }}>No incoming payments</Typography>
                </Box>
              ) : (
                payments.received.map(g => (
                  <GroupRow key={g.address} group={g} direction="received" onTrace={(addr, name) => goTo(addr, name)} />
                ))
              )}
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            {sectionLabel('sent', payments.sent.length)}
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden' }}>
              {payments.sent.length === 0 ? (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: c.textSecondary }}>No outgoing payments</Typography>
                </Box>
              ) : (
                payments.sent.map(g => (
                  <GroupRow key={g.address} group={g} direction="sent" onTrace={(addr, name) => goTo(addr, name)} />
                ))
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Empty state */}
      {trail.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', pt: 8 }}>
          <Typography sx={{ fontSize: '0.9rem', color: c.textSecondary }}>Enter an address to start tracing</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: c.textSecondary, mt: 0.75, opacity: 0.6 }}>
            Click any counterparty to follow the trail deeper
          </Typography>
        </Box>
      )}
    </Box>
  );
}
