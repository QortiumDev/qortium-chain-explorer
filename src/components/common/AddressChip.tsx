import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useColors } from '../../theme/ColorTokensContext';
import { truncHash } from '../../utils/format';
import { useAddressName } from '../../hooks/useAddressName';

interface AddressChipProps {
  address: string;
  onClick?: () => void;
  full?: boolean;
}

export function AddressChip({ address, onClick, full = false }: AddressChipProps) {
  const c = useColors();
  const name = useAddressName(address);
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  const displayAddr = full ? address : truncHash(address);

  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'flex-start', gap: 0.25,
        '&:hover .ac-copy': { opacity: 1 },
      }}
    >
      <Box onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
        {name ? (
          <>
            <Typography sx={{
              fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.3,
              color: onClick ? c.accent : c.textPrimary,
              transition: '0.12s ease',
              '&:hover': onClick ? { color: c.accentHover } : {},
            }}>
              {name}
            </Typography>
            <Typography sx={{
              fontSize: '0.68rem', fontFamily: 'monospace', lineHeight: 1.3,
              color: c.textSecondary, wordBreak: 'break-all',
            }}>
              {displayAddr}
            </Typography>
          </>
        ) : (
          <Typography sx={{
            fontSize: '0.78rem', fontFamily: 'monospace',
            color: onClick ? c.accent : c.textSecondary,
            transition: '0.12s ease',
            '&:hover': onClick ? { color: c.accentHover } : {},
            wordBreak: 'break-all',
          }}>
            {displayAddr}
          </Typography>
        )}
      </Box>
      <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
        <IconButton
          className="ac-copy"
          size="small"
          onClick={handleCopy}
          sx={{ opacity: 0, width: 18, height: 18, mt: '1px', transition: '0.1s ease', color: copied ? c.success : c.textSecondary, flexShrink: 0 }}
        >
          {copied
            ? <CheckIcon sx={{ fontSize: '0.65rem' }} />
            : <ContentCopyIcon sx={{ fontSize: '0.65rem' }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
