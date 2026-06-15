import { useState } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, IconButton, InputBase, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColors } from '../../theme/ColorTokensContext';
import { tokens } from '../../theme/tokens';
import { themeAtom } from '../../state/atoms';
import { EnumTheme } from '../../types';

function routeSearch(q: string, navigate: ReturnType<typeof useNavigate>) {
  const s = q.trim();
  if (!s) return;
  if (/^\d+$/.test(s)) { navigate(`/block/${s}`); return; }
  if (s.length >= 26 && s.startsWith('Q')) { navigate(`/?address=${encodeURIComponent(s)}`); return; }
  navigate(`/tx/${encodeURIComponent(s)}`);
}

export function TopBar() {
  const c = useColors();
  const [theme, setTheme] = useAtom(themeAtom);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState('');

  function handleSearch() {
    routeSearch(search, navigate);
    setSearch('');
  }

  const isBlocks   = pathname === '/blocks' || pathname.startsWith('/block/');
  const isPayments = pathname === '/payments';
  const isTxs      = !isBlocks && !isPayments;

  const navBtnSx = (active: boolean) => ({
    fontSize: '0.78rem', fontWeight: tokens.typography.weightBold,
    color: active ? c.accent : c.textSecondary,
    borderRadius: `${tokens.shape.radius}px`,
    px: 1.5, minHeight: 34,
    borderBottom: active ? `2px solid ${c.accent}` : '2px solid transparent',
    '&:hover': { color: c.accent, bgcolor: 'transparent' },
  });

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: tokens.spacing.topBarHeight,
        bgcolor: c.surface,
        borderBottom: `${tokens.shape.borderWidth} solid ${c.borderLight}`,
        display: 'flex', alignItems: 'center',
        px: 2, gap: 1, zIndex: 100,
      }}
    >
      <Box sx={{ fontWeight: tokens.typography.weightBlack, fontSize: '1rem', color: c.textPrimary, letterSpacing: '-0.01em', flexShrink: 0, mr: 1 }}>
        Chain
      </Box>

      <Button disableRipple onClick={() => navigate('/')} sx={navBtnSx(isTxs)}>
        Transactions
      </Button>
      <Button disableRipple onClick={() => navigate('/blocks')} sx={navBtnSx(isBlocks)}>
        Blocks
      </Button>
      <Button disableRipple onClick={() => navigate('/payments')} sx={navBtnSx(isPayments)}>
        Payments
      </Button>

      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 0.75,
        border: `${tokens.shape.borderWidth} solid ${c.borderLight}`,
        borderRadius: `${tokens.shape.radius}px`,
        px: 1.5, height: 34,
        '&:focus-within': { borderColor: c.accent },
        transition: '0.15s ease',
        mx: 2,
      }}>
        <SearchIcon sx={{ fontSize: '0.9rem', color: c.textSecondary, flexShrink: 0 }} />
        <InputBase
          fullWidth
          placeholder="Jump to block #, tx signature, or address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          sx={{ fontSize: '0.82rem', color: c.textPrimary, '& input::placeholder': { color: c.textSecondary, opacity: 1 } }}
        />
      </Box>

      <Tooltip title={theme === EnumTheme.DARK ? 'Light mode' : 'Dark mode'} placement="bottom">
        <IconButton
          onClick={() => setTheme(t => t === EnumTheme.DARK ? EnumTheme.LIGHT : EnumTheme.DARK)}
          sx={{ borderRadius: `${tokens.shape.radius}px`, minWidth: 44, minHeight: 44, color: c.textSecondary, '&:hover': { color: c.accent, bgcolor: c.borderLight }, transition: '0.15s ease' }}
        >
          {theme === EnumTheme.DARK ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
