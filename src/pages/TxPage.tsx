import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { HashChip } from '../components/common/HashChip';
import { fetchTransaction } from '../api/rest';
import { formatDate, formatQort, txTypeLabel, txTypeCategory } from '../utils/format';
import type { TxData } from '../types';

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: `1px solid ${c.borderLight}`, '&:last-child': { borderBottom: 'none' }, flexWrap: 'wrap' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: tokens.typography.weightBold, color: c.textSecondary, minWidth: 130, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em', pt: '2px' }}>
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

function TypeBadge({ type }: { type: string }) {
  const c = useColors();
  const cat = txTypeCategory(type);
  const color = cat === 'transfer' ? c.success : cat === 'name' ? c.accent : c.textSecondary;
  return (
    <Box sx={{
      display: 'inline-block',
      fontSize: '0.68rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.08em', textTransform: 'uppercase',
      color, border: `1.5px solid ${color}55`, borderRadius: '4px',
      px: 1.25, py: 0.5, lineHeight: 1.6,
    }}>
      {txTypeLabel(type)}
    </Box>
  );
}

export function TxPage() {
  const { signature } = useParams<{ signature: string }>();
  const navigate = useNavigate();
  const c = useColors();
  const [tx, setTx]       = useState<TxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!signature) return;
    setLoading(true);
    setError(null);
    fetchTransaction(decodeURIComponent(signature))
      .then(t => { setTx(t); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : String(e)); setLoading(false); });
  }, [signature]);

  if (loading) {
    return (
      <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} sx={{ color: c.accent }} />
      </Box>
    );
  }

  if (error || !tx) {
    return (
      <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        <Typography sx={{ color: c.error, fontSize: '0.85rem' }}>{error ?? 'Transaction not found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button onClick={() => navigate(-1)} size="small" startIcon={<ArrowBackIcon />}
          sx={{ color: c.textSecondary, fontWeight: tokens.typography.weightBold, fontSize: '0.72rem', minWidth: 0, p: 0, '&:hover': { color: c.accent, bgcolor: 'transparent' } }}>
          Back
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary }}>Transaction</Typography>
        <TypeBadge type={tx.type} />
      </Box>

      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, px: 2.5, py: 0.5 }}>
        <FieldRow label="Signature">
          <HashChip hash={tx.signature} full />
        </FieldRow>
        <FieldRow label="Timestamp"><FieldText>{formatDate(tx.timestamp)}</FieldText></FieldRow>
        {tx.blockHeight != null && (
          <FieldRow label="Block">
            <Typography
              sx={{ fontSize: '0.85rem', color: c.accent, cursor: 'pointer', fontWeight: tokens.typography.weightBold, '&:hover': { color: c.accentHover } }}
              onClick={() => navigate(`/block/${tx.blockHeight}`)}
            >
              #{tx.blockHeight.toLocaleString()}
            </Typography>
          </FieldRow>
        )}
        {tx.fee != null && (
          <FieldRow label="Fee"><FieldText>{formatQort(tx.fee)} QORT</FieldText></FieldRow>
        )}
        {tx.creatorPublicKey && (
          <FieldRow label="Creator (pubkey)">
            <HashChip hash={tx.creatorPublicKey} />
          </FieldRow>
        )}
        {tx.recipient && (
          <FieldRow label="Recipient">
            <HashChip hash={tx.recipient} onClick={() => navigate(`/address/${tx.recipient}`)} />
          </FieldRow>
        )}
        {tx.amount != null && (
          <FieldRow label="Amount">
            <Typography sx={{ fontSize: '0.85rem', fontWeight: tokens.typography.weightBold, color: c.success }}>
              {formatQort(tx.amount)} QORT
            </Typography>
          </FieldRow>
        )}
        {tx.name && <FieldRow label="Name"><FieldText>{tx.name}</FieldText></FieldRow>}
        {tx.assetId != null && (
          <FieldRow label="Asset">
            <FieldText>{tx.assetName ? `${tx.assetName} (ID: ${tx.assetId})` : `ID: ${tx.assetId}`}</FieldText>
          </FieldRow>
        )}
        {tx.seller && (
          <FieldRow label="Seller">
            <HashChip hash={tx.seller} onClick={() => navigate(`/address/${tx.seller}`)} />
          </FieldRow>
        )}
        {tx.data && (
          <FieldRow label="Data">
            <Typography sx={{ fontSize: '0.78rem', color: c.textSecondary, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {tx.data.length > 200 ? `${tx.data.slice(0, 200)}…` : tx.data}
            </Typography>
          </FieldRow>
        )}
        {tx.approvalStatus && tx.approvalStatus !== 'NOT_REQUIRED' && (
          <FieldRow label="Approval"><FieldText>{tx.approvalStatus}</FieldText></FieldRow>
        )}
        {tx.txGroupId != null && tx.txGroupId !== 0 && (
          <FieldRow label="Group ID"><FieldText>{tx.txGroupId}</FieldText></FieldRow>
        )}
      </Box>
    </Box>
  );
}
