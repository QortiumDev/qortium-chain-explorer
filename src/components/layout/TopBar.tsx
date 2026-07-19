import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Box, Button, IconButton, InputBase, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColors } from '../../theme/ColorTokensContext';
import { tokens } from '../../theme/tokens';
import { uiStyleAtom } from '../../state/atoms';
import { RatingControl } from './RatingControl';
import { AppIcon, getOwnQdnName } from './AppIdentity';

const APP_QDN_NAME = getOwnQdnName('Chain');
const APP_QDN_IDENTIFIER = 'Chain';

function routeSearch(q: string, navigate: ReturnType<typeof useNavigate>) {
  const s = q.trim();
  if (!s) return;
  if (/^\d+$/.test(s)) { navigate(`/block/${s}`); return; }
  if (s.length >= 26 && s.startsWith('Q')) { navigate(`/?address=${encodeURIComponent(s)}`); return; }
  navigate(`/tx/${encodeURIComponent(s)}`);
}

export function TopBar() {
  const c = useColors();
  const uiStyle = useAtomValue(uiStyleAtom);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [isFollowed, setIsFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const isClassic = uiStyle === 'classic';

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--chain-top-bar-height',
        `${header.getBoundingClientRect().height}px`,
      );
    };

    updateHeight();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isClassic]);

  useEffect(() => {
    qdnRequest({ action: 'GET_LIST', listName: 'followedNames' })
      .then((list) => { setIsFollowed(Array.isArray(list) && (list as string[]).includes(APP_QDN_NAME)); })
      .catch(() => {});
  }, []);

  async function handleToggleFollow() {
    if (followBusy) return;
    setFollowBusy(true);
    try {
      if (isFollowed) {
        await qdnRequest({ action: 'REMOVE_FROM_LIST', listName: 'followedNames', items: [APP_QDN_NAME] });
        setIsFollowed(false);
      } else {
        await qdnRequest({ action: 'ADD_TO_LIST', listName: 'followedNames', items: [APP_QDN_NAME] });
        setIsFollowed(true);
      }
    } catch {}
    setFollowBusy(false);
  }

  function handleOpenHelp() {
    void qdnRequest({ action: 'OPEN_NEW_TAB', address: `qdn://APP/Help/Help?new=${APP_QDN_NAME}` });
  }

  function handleSearch() {
    routeSearch(search, navigate);
    setSearch('');
  }

  const buttonSx = {
    borderRadius: `${isClassic ? tokens.shape.radiusMd : tokens.shape.radius}px`,
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    p: 0,
    color: c.textSecondary,
    '&:hover': { color: c.accent, bgcolor: isClassic ? c.controlHover : c.borderLight },
    transition: c.transitionControl,
  };

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
      ref={headerRef}
      sx={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: isClassic ? 'auto' : tokens.spacing.topBarHeight,
        minHeight: isClassic ? 'auto' : tokens.spacing.topBarHeight,
        bgcolor: c.surface,
        borderBottom: `${isClassic ? tokens.shape.classicBorderWidth : tokens.shape.borderWidth} solid ${isClassic ? c.border : c.borderLight}`,
        boxShadow: isClassic ? c.topBarShadow : 'none',
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        px: isClassic ? { xs: 1.25, sm: 1.75 } : 2,
        py: isClassic ? 1 : 0,
        gap: isClassic ? 1 : 1, zIndex: 100,
      }}
    >
      <Box
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          color: c.textPrimary,
          cursor: 'pointer',
          '&:hover': { color: c.accent },
          transition: c.transitionControl,
          userSelect: 'none',
          minWidth: 0,
          mr: 1,
        }}
      >
        <AppIcon qdnName={APP_QDN_NAME} />
        <Box sx={{
          fontWeight: tokens.typography.weightBlack,
          fontSize: '1rem',
          color: 'inherit',
          maxWidth: { xs: 140, sm: 240 },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {APP_QDN_NAME}
        </Box>
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

      <RatingControl qdnName={APP_QDN_NAME} identifier={APP_QDN_IDENTIFIER} />

      <Tooltip title={isFollowed ? 'Stop following this app' : 'Follow this app'} placement="bottom">
        <IconButton
          size="small"
          onClick={() => void handleToggleFollow()}
          disabled={followBusy}
          sx={{ ...buttonSx, color: isFollowed ? c.accent : c.textSecondary }}
        >
          {isFollowed ? <PersonRemoveAlt1Icon fontSize="small" /> : <PersonAddAlt1Icon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Help & Feedback" placement="bottom">
        <IconButton
          size="small"
          onClick={handleOpenHelp}
          sx={buttonSx}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
