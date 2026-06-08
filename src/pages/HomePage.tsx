import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Button, Checkbox, CircularProgress, Collapse, IconButton,
  InputBase, MenuItem, Select, Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { TxRow } from '../components/common/TxRow';
import { searchTransactions } from '../api/rest';
import { TX_TYPES, txTypeLabel } from '../utils/format';
import type { TxData } from '../types';

const REFRESH_MS = 2 * 60 * 1000;
type ConfirmStatus = 'CONFIRMED' | 'UNCONFIRMED' | 'BOTH';
type Filters = { addr: string; nm: string; types: string[]; status: ConfirmStatus; from: string; to: string; grp: string; rev: boolean; lim: number; };

export function HomePage() {
  const c = useColors();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchId       = useRef(0);
  const refreshTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeFilters  = useRef<Filters>({ addr: '', nm: '', types: [], status: 'CONFIRMED', from: '', to: '', grp: '', rev: true, lim: 20 });
  const userPaged      = useRef(false);

  // Filter state
  const [address,       setAddress]    = useState('');
  const [name,          setName]       = useState('');
  const [txTypes,       setTxTypes]    = useState<string[]>([]);
  const [confirmStatus, setConfirm]    = useState<ConfirmStatus>('CONFIRMED');
  const [startBlock,    setStartBlock]  = useState('');
  const [blockLimit,    setBlockLimit]  = useState('');
  const [groupId,       setGroupId]     = useState('');
  const [limit,         setLimit]      = useState(20);
  const [reverse,       setReverse]    = useState(true);
  const [showAdv,       setShowAdv]    = useState(false);

  // Results state
  const [results,       setResults]      = useState<TxData[]>([]);
  const [loading,       setLoading]      = useState(false);
  const [manualLoading, setManualLoading]= useState(false);
  const [offset,        setOffset]       = useState(0);
  const [hasMore,       setHasMore]      = useState(false);
  const [resLabel,      setResLabel]     = useState('Recent Transactions');

  // Expansion state — tracked by signature
  const [expandedSigs, setExpandedSigs] = useState<Set<string>>(new Set());

  function toggleExpand(sig: string) {
    setExpandedSigs(prev => {
      const next = new Set(prev);
      if (next.has(sig)) next.delete(sig); else next.add(sig);
      return next;
    });
  }

  // ─── Cleanup interval on unmount ────────────────────────────────────────────

  useEffect(() => () => { if (refreshTimer.current) clearInterval(refreshTimer.current); }, []);

  // ─── Fetch a single batch ────────────────────────────────────────────────────

  async function fetchBatch(f: Filters, fromOffset: number, myId: number) {
    const res = await searchTransactions({
      address:            f.addr || undefined,
      name:               f.nm   || undefined,
      txTypes:            f.types.length ? f.types : undefined,
      confirmationStatus: f.status,
      startBlock:         f.from ? parseInt(f.from) : undefined,
      blockLimit:         f.to   ? parseInt(f.to)   : undefined,
      txGroupId:          f.grp  ? parseInt(f.grp)  : undefined,
      limit:              f.lim,
      offset:             fromOffset,
      reverse:            f.rev,
    });
    if (myId !== searchId.current) return;
    if (fromOffset === 0) { setResults(res); setLoading(false); }
    else                    setResults(prev => [...prev, ...res]);
    setOffset(fromOffset + res.length);
    setHasMore(res.length === f.lim);
    setManualLoading(false);
  }

  // ─── Silent refresh (2-min tick, only when user hasn't paged) ───────────────

  async function silentRefresh() {
    if (userPaged.current) return;
    const f = activeFilters.current;
    const myId = searchId.current;
    const res = await searchTransactions({
      address:            f.addr || undefined,
      name:               f.nm   || undefined,
      txTypes:            f.types.length ? f.types : undefined,
      confirmationStatus: f.status,
      startBlock:         f.from ? parseInt(f.from) : undefined,
      blockLimit:         f.to   ? parseInt(f.to)   : undefined,
      txGroupId:          f.grp  ? parseInt(f.grp)  : undefined,
      limit:  f.lim,
      offset: 0,
      reverse: f.rev,
    });
    if (myId !== searchId.current) return;
    setResults(res);
    setOffset(res.length);
    setHasMore(res.length === f.lim);
  }

  function runSearch(
    addr: string, nm: string, types: string[], status: ConfirmStatus,
    from: string, to: string, grp: string, rev: boolean, lim: number,
  ) {
    const f: Filters = { addr, nm, types, status, from, to, grp, rev, lim };
    activeFilters.current = f;
    userPaged.current = false;

    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => { void silentRefresh(); }, REFRESH_MS);

    const myId = ++searchId.current;
    setLoading(true);
    setResults([]);
    setHasMore(false);
    setOffset(0);
    setExpandedSigs(new Set());
    void fetchBatch(f, 0, myId);
  }

  function buildLabel(addr: string, nm: string, types: string[]) {
    const parts: string[] = [];
    if (addr)         parts.push(addr.length > 12 ? `${addr.slice(0, 10)}…` : addr);
    if (nm)           parts.push(`name: ${nm}`);
    if (types.length) parts.push(types.length === 1 ? txTypeLabel(types[0]) : `${types.length} types`);
    return parts.length ? `Transactions — ${parts.join(' · ')}` : 'Recent Transactions';
  }

  // ─── Read URL params on mount ────────────────────────────────────────────────

  useEffect(() => {
    const addr   = searchParams.get('address') ?? '';
    const nm     = searchParams.get('name') ?? '';
    const types  = searchParams.get('type') ? searchParams.get('type')!.split(',').filter(Boolean) : [];
    const status = (searchParams.get('status') as ConfirmStatus) || 'CONFIRMED';
    const from   = searchParams.get('from') ?? '';
    const blklim = searchParams.get('blocklimit') ?? '';
    const grp    = searchParams.get('group') ?? '';
    const lim    = parseInt(searchParams.get('limit') ?? '20') || 20;
    const rev    = searchParams.get('reverse') !== 'false';

    setAddress(addr); setName(nm); setTxTypes(types); setConfirm(status);
    setStartBlock(from); setBlockLimit(blklim); setGroupId(grp);
    setLimit(lim); setReverse(rev);
    if (from || blklim || grp) setShowAdv(true);
    setResLabel(buildLabel(addr, nm, types));
    runSearch(addr, nm, types, status, from, blklim, grp, rev, lim);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Search handler ──────────────────────────────────────────────────────────

  function handleSearch() {
    const p: Record<string, string> = {};
    if (address)                       p.address = address;
    if (name)                          p.name    = name;
    if (txTypes.length)                p.type    = txTypes.join(',');
    if (confirmStatus !== 'CONFIRMED') p.status  = confirmStatus;
    if (startBlock)                    p.from       = startBlock;
    if (blockLimit)                    p.blocklimit = blockLimit;
    if (groupId)                       p.group   = groupId;
    if (limit !== 20)                  p.limit   = String(limit);
    if (!reverse)                      p.reverse = 'false';
    setSearchParams(p);
    setResLabel(buildLabel(address, name, txTypes));
    runSearch(address, name, txTypes, confirmStatus, startBlock, blockLimit, groupId, reverse, limit);
  }

  // ─── Load more ───────────────────────────────────────────────────────────────

  function handleLoadMore() {
    userPaged.current = true;
    const myId = ++searchId.current;
    setManualLoading(true);
    void fetchBatch(activeFilters.current, offset, myId);
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────

  const fieldSx = {
    display: 'flex', alignItems: 'center',
    border: `${tokens.shape.borderWidth} solid ${c.borderLight}`,
    borderRadius: `${tokens.shape.radius}px`,
    px: 1.5, height: 34,
    '&:focus-within': { borderColor: c.accent },
    transition: '0.15s ease',
  };

  const inputSx = {
    fontSize: '0.82rem', color: c.textPrimary,
    '& input::placeholder': { color: c.textSecondary, opacity: 1 },
  };

  const selectSx = {
    height: 34, fontSize: '0.82rem', color: c.textPrimary,
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
    border: `${tokens.shape.borderWidth} solid ${c.borderLight}`,
    borderRadius: `${tokens.shape.radius}px`,
    '&:hover': { borderColor: c.accent },
    '& .MuiSelect-select': { py: 0 },
  };

  const busy = loading || manualLoading;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      {/* Filter card */}
      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, px: 2.5, py: 2, mb: 2 }}>

        {/* Primary row */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>

          <Box sx={{ ...fieldSx, flex: '3 1 180px', minWidth: 0 }}>
            <InputBase fullWidth placeholder="Address" value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={inputSx} />
          </Box>

          <Box sx={{ ...fieldSx, flex: '1 1 110px', minWidth: 0 }}>
            <InputBase fullWidth placeholder="Name" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              sx={inputSx} />
          </Box>

          {/* TX type multi-select */}
          <Select
            multiple displayEmpty
            value={txTypes as unknown as string}
            onChange={e => {
              const v = e.target.value as unknown as string | string[];
              setTxTypes(typeof v === 'string' ? v.split(',') : v);
            }}
            renderValue={sel => {
              const s = sel as unknown as string[];
              if (s.length === 0) return <span style={{ color: c.textSecondary }}>All Types</span>;
              return s.length === 1 ? txTypeLabel(s[0]) : `${s.length} types`;
            }}
            sx={{ ...selectSx, flex: '1 1 110px', minWidth: 100 }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
          >
            {TX_TYPES.map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: '0.82rem' }}>{txTypeLabel(t)}</MenuItem>
            ))}
          </Select>

          {/* Confirmation status */}
          <Select value={confirmStatus}
            onChange={e => setConfirm(e.target.value as ConfirmStatus)}
            sx={{ ...selectSx, flex: '0 0 auto' }}
          >
            {(['CONFIRMED', 'UNCONFIRMED', 'BOTH'] as const).map(o => (
              <MenuItem key={o} value={o} sx={{ fontSize: '0.82rem' }}>
                {o.charAt(0) + o.slice(1).toLowerCase()}
              </MenuItem>
            ))}
          </Select>

          {/* Reverse */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, height: 34 }}>
            <Checkbox
              size="small"
              checked={reverse}
              onChange={e => setReverse(e.target.checked)}
              sx={{ p: 0.5, color: c.textSecondary, '&.Mui-checked': { color: c.accent } }}
            />
            <Typography sx={{ fontSize: '0.78rem', color: c.textSecondary, userSelect: 'none' }}>
              Reverse
            </Typography>
          </Box>

          {/* Advanced toggle */}
          <IconButton size="small" onClick={() => setShowAdv(v => !v)}
            sx={{
              color: showAdv ? c.accent : c.textSecondary,
              border: `${tokens.shape.borderWidth} solid ${showAdv ? c.accent : c.borderLight}`,
              borderRadius: `${tokens.shape.radius}px`,
              width: 34, height: 34,
              '&:hover': { color: c.accent, borderColor: c.accent },
            }}>
            <TuneIcon sx={{ fontSize: '1rem' }} />
          </IconButton>

          {/* Search button */}
          <Button variant="contained" onClick={handleSearch} disabled={busy}
            sx={{
              height: 34, bgcolor: c.accent, color: '#fff',
              borderRadius: `${tokens.shape.radius}px`,
              fontSize: '0.82rem', px: 2, boxShadow: 'none', flexShrink: 0,
              '&:hover': { bgcolor: c.accentHover, boxShadow: 'none' },
              '&.Mui-disabled': { opacity: 0.4 },
            }}>
            Search
          </Button>
        </Box>

        {/* Advanced filters */}
        <Collapse in={showAdv}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: `1px solid ${c.borderLight}` }}>
            <Box sx={{ ...fieldSx, flex: '1 1 110px' }}>
              <InputBase fullWidth placeholder="Start block" value={startBlock} type="number"
                onChange={e => setStartBlock(e.target.value)} sx={inputSx} />
            </Box>
            <Box sx={{ ...fieldSx, flex: '1 1 110px' }}>
              <InputBase fullWidth placeholder="Block limit" value={blockLimit} type="number"
                onChange={e => setBlockLimit(e.target.value)} sx={inputSx} />
            </Box>
            <Box sx={{ ...fieldSx, flex: '1 1 100px' }}>
              <InputBase fullWidth placeholder="Group ID" value={groupId} type="number"
                onChange={e => setGroupId(e.target.value)} sx={inputSx} />
            </Box>

            {/* Limit */}
            <Select value={limit}
              onChange={e => setLimit(e.target.value as number)}
              sx={{ ...selectSx, flex: '0 0 auto' }}
            >
              {[20, 50, 100, 200].map(n => (
                <MenuItem key={n} value={n} sx={{ fontSize: '0.82rem' }}>{n} per page</MenuItem>
              ))}
            </Select>

            <Button variant="text" size="small"
              onClick={() => {
                setStartBlock(''); setBlockLimit(''); setGroupId('');
                setTxTypes([]); setAddress(''); setName('');
                setConfirm('CONFIRMED'); setLimit(20); setReverse(true);
              }}
              sx={{ fontSize: '0.75rem', color: c.textSecondary, '&:hover': { color: c.accent }, ml: 'auto' }}>
              Clear all
            </Button>
          </Box>
        </Collapse>
      </Box>

      {/* Results header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary }}>
          {resLabel}
        </Typography>
        {results.length > 0 && (
          <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary }}>
            {results.length}{hasMore ? '+' : ''} result{results.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {/* Results list */}
      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={24} sx={{ color: c.accent }} />
          </Box>
        ) : results.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary }}>No transactions found.</Typography>
          </Box>
        ) : (
          results.map(tx => (
            <TxRow
              key={tx.signature}
              tx={tx}
              expanded={expandedSigs.has(tx.signature)}
              onToggle={() => toggleExpand(tx.signature)}
            />
          ))
        )}
      </Box>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => { void handleLoadMore(); }} disabled={manualLoading}
            sx={{ borderColor: c.accent, color: c.accent, borderRadius: '50px', fontSize: '0.75rem', px: 3, '&:hover': { bgcolor: c.borderLight }, '&.Mui-disabled': { opacity: 0.35 } }}>
            {manualLoading ? <CircularProgress size={14} sx={{ color: c.accent }} /> : 'Load more'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
