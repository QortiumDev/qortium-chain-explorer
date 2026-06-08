import { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useColors } from '../../theme/ColorTokensContext';
import { truncHash } from '../../utils/format';

interface HashChipProps {
  hash: string;
  onClick?: () => void;
  full?: boolean;
}

export function HashChip({ hash, onClick, full = false }: HashChipProps) {
  const c = useColors();
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    void navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.25,
        fontFamily: 'monospace', fontSize: '0.78rem',
        color: onClick ? c.accent : c.textSecondary,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover .ch-copy': { opacity: 1 },
        '&:hover': onClick ? { color: c.accentHover } : {},
        transition: '0.12s ease',
        wordBreak: 'break-all',
      }}
      onClick={onClick}
    >
      <span>{full ? hash : truncHash(hash)}</span>
      <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
        <IconButton
          className="ch-copy"
          size="small"
          onClick={handleCopy}
          sx={{ opacity: 0, width: 18, height: 18, transition: '0.1s ease', color: copied ? c.success : c.textSecondary, flexShrink: 0 }}
        >
          {copied
            ? <CheckIcon sx={{ fontSize: '0.65rem' }} />
            : <ContentCopyIcon sx={{ fontSize: '0.65rem' }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
