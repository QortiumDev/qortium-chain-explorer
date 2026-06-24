import type { MouseEvent } from 'react';
import { Box, Collapse, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useColors } from '../../theme/ColorTokensContext';
import { tokens } from '../../theme/tokens';
import { formatAge, formatDate, formatQort, serviceLabel, txTypeLabel, txTypeCategory, type TxCategory } from '../../utils/format';
import type { TxData } from '../../types';

function categoryColor(cat: TxCategory, c: ReturnType<typeof useColors>): string {
  if (cat === 'transfer') return c.success;
  if (cat === 'name')     return c.accent;
  if (cat === 'asset')    return c.accent;
  return c.textSecondary;
}

function TxTypeBadge({ type }: { type: string }) {
  const c = useColors();
  const cat = txTypeCategory(type);
  const color = categoryColor(cat, c);
  return (
    <Box sx={{
      display: 'inline-block', flexShrink: 0,
      fontSize: '0.58rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.08em', textTransform: 'uppercase',
      color, border: `1px solid ${color}50`, borderRadius: '3px',
      px: 0.75, py: '2px', lineHeight: 1.6, whiteSpace: 'nowrap',
    }}>
      {txTypeLabel(type)}
    </Box>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Box sx={{
      display: 'flex', gap: 2, py: 0.9,
      borderBottom: `1px solid ${c.borderLight}`,
      '&:last-child': { borderBottom: 'none' },
      flexWrap: 'wrap', alignItems: 'flex-start',
    }}>
      <Typography sx={{
        fontSize: '0.62rem', fontWeight: tokens.typography.weightBold, color: c.textSecondary,
        textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: 115, flexShrink: 0, pt: '2px',
      }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

function FieldText({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Typography sx={{ fontSize: '0.82rem', color: c.textPrimary }}>{children}</Typography>;
}

function AddrLink({ address }: { address: string }) {
  const c = useColors();
  const navigate = useNavigate();
  return (
    <Typography
      onClick={(e: MouseEvent) => { e.stopPropagation(); navigate(`/address/${address}`); }}
      sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: c.accent, cursor: 'pointer', wordBreak: 'break-all', '&:hover': { color: c.accentHover } }}
    >
      {address}
    </Typography>
  );
}

export function TxRow({ tx, expanded, onToggle }: { tx: TxData; expanded: boolean; onToggle: () => void }) {
  const c = useColors();
  const navigate = useNavigate();

  // Build a summary detail for the collapsed row
  const summary = tx.amount
    ? `${formatQort(tx.amount)} QORT`
    : tx.name ?? null;

  // Cast to full record for raw JSON display (captures any API fields beyond our type)
  const raw = tx as unknown as Record<string, unknown>;

  return (
    <Box sx={{ borderBottom: `1px solid ${c.borderLight}`, '&:last-child': { borderBottom: 'none' } }}>

      {/* ── Summary row — click anywhere to expand ── */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 2.5, py: 1.5, cursor: 'pointer', minWidth: 0,
          '&:hover': { bgcolor: c.borderLight },
          transition: '0.12s ease',
          bgcolor: expanded ? c.borderLight : 'transparent',
        }}
      >
        {/* Type badge + service (ARBITRARY) + sig */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, minWidth: 0, flex: '0 0 auto', maxWidth: 160 }}>
          <TxTypeBadge type={tx.type} />
          {tx.type === 'ARBITRARY' && tx.service && (
            <Typography sx={{ fontSize: '0.62rem', fontWeight: tokens.typography.weightBold, color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {serviceLabel(tx.service)}{tx.identifier ? ` · ${tx.identifier}` : ''}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tx.signature.slice(0, 10)}…
          </Typography>
        </Box>

        {/* Recipient / name */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {tx.recipient && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary, flexShrink: 0 }}>→</Typography>
              <Typography
                sx={{ fontSize: '0.78rem', fontFamily: 'monospace', color: c.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: c.accentHover } }}
                onClick={(e: MouseEvent) => { e.stopPropagation(); navigate(`/address/${tx.recipient}`); }}
              >
                {tx.recipient.slice(0, 12)}…
              </Typography>
            </Box>
          )}
          {!tx.recipient && tx.name && (
            <Typography sx={{ fontSize: '0.78rem', color: c.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tx.name}
            </Typography>
          )}
        </Box>

        {/* Amount + age */}
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          {summary && (
            <Typography sx={{ fontSize: '0.82rem', fontWeight: tokens.typography.weightBold, color: tx.amount ? c.success : c.textPrimary, whiteSpace: 'nowrap' }}>
              {summary}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary }}>
            {formatAge(tx.timestamp)}
          </Typography>
        </Box>

        {/* Expand chevron */}
        <ExpandMoreIcon sx={{
          fontSize: '1rem', color: c.textSecondary, flexShrink: 0,
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }} />
      </Box>

      {/* ── Inline details ── */}
      <Collapse in={expanded}>
        <Box sx={{ bgcolor: c.bg, borderTop: `1px solid ${c.borderLight}`, px: 2.5, pt: 1.5, pb: 2 }}>

          <Field label="Signature">
            <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: c.textPrimary, wordBreak: 'break-all' }}>
              {tx.signature}
            </Typography>
          </Field>

          <Field label="Timestamp"><FieldText>{formatDate(tx.timestamp)}</FieldText></Field>

          {tx.blockHeight != null && (
            <Field label="Block">
              <Typography
                sx={{ fontSize: '0.82rem', fontWeight: tokens.typography.weightBold, color: c.accent, cursor: 'pointer', '&:hover': { color: c.accentHover } }}
                onClick={(e: MouseEvent) => { e.stopPropagation(); navigate(`/block/${tx.blockHeight}`); }}
              >
                #{tx.blockHeight.toLocaleString()}
              </Typography>
            </Field>
          )}

          {tx.fee != null && (
            <Field label="Fee"><FieldText>{formatQort(tx.fee)} QORT</FieldText></Field>
          )}

          {tx.creatorAddress && (
            <Field label="Sender"><AddrLink address={tx.creatorAddress} /></Field>
          )}
          {tx.creatorPublicKey && (
            <Field label="Creator Key">
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: c.textSecondary, wordBreak: 'break-all' }}>
                {tx.creatorPublicKey}
              </Typography>
            </Field>
          )}

          {tx.recipient && (
            <Field label="Recipient"><AddrLink address={tx.recipient} /></Field>
          )}

          {tx.amount != null && (
            <Field label="Amount">
              <Typography sx={{ fontSize: '0.82rem', fontWeight: tokens.typography.weightBold, color: c.success }}>
                {formatQort(tx.amount)} QORT
              </Typography>
            </Field>
          )}

          {tx.seller && (
            <Field label="Seller"><AddrLink address={tx.seller} /></Field>
          )}

          {/* ARBITRARY fields */}
          {tx.service && (
            <Field label="Service"><FieldText>{serviceLabel(tx.service)} ({tx.service})</FieldText></Field>
          )}
          {tx.identifier && (
            <Field label="Identifier"><FieldText>{tx.identifier}</FieldText></Field>
          )}
          {tx.size != null && (
            <Field label="Size"><FieldText>{tx.size.toLocaleString()} bytes</FieldText></Field>
          )}

          {/* Name */}
          {tx.name && (
            <Field label="Name"><FieldText>{tx.name}</FieldText></Field>
          )}

          {/* Asset */}
          {tx.assetId != null && (
            <Field label="Asset">
              <FieldText>{tx.assetName ? `${tx.assetName} (ID: ${tx.assetId})` : `ID: ${tx.assetId}`}</FieldText>
            </Field>
          )}

          {/* Data */}
          {tx.data && (
            <Field label="Data">
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: c.textSecondary, wordBreak: 'break-all' }}>
                {tx.data}
              </Typography>
            </Field>
          )}

          {tx.approvalStatus && tx.approvalStatus !== 'NOT_REQUIRED' && (
            <Field label="Approval"><FieldText>{tx.approvalStatus}</FieldText></Field>
          )}

          {tx.txGroupId != null && tx.txGroupId !== 0 && (
            <Field label="Group ID"><FieldText>{tx.txGroupId}</FieldText></Field>
          )}

          {/* Raw JSON */}
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.75 }}>
              Raw
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0, p: 1.5,
                fontSize: '0.68rem', fontFamily: 'monospace', lineHeight: 1.5,
                color: c.textSecondary,
                bgcolor: c.surface,
                border: `1px solid ${c.borderLight}`,
                borderRadius: `${tokens.shape.radius - 2}px`,
                overflowX: 'auto', overflowY: 'auto',
                maxHeight: 240,
                whiteSpace: 'pre',
              }}
            >
              {JSON.stringify(raw, null, 2)}
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
