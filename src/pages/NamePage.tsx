import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Chip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useColors } from '../theme/ColorTokensContext';
import { tokens } from '../theme/tokens';
import { fetchNameInfo, fetchQdnResourcesByName } from '../api/rest';
import { formatAge, formatDate, serviceLabel } from '../utils/format';
import type { NameInfo, QdnResource } from '../types';

const RES_LIMIT = 50;

function ServiceBadge({ service }: { service: string }) {
  const c = useColors();
  return (
    <Box sx={{
      display: 'inline-block', flexShrink: 0,
      fontSize: '0.58rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: c.accent, border: `1px solid ${c.accent}50`, borderRadius: '3px',
      px: 0.75, py: '2px', lineHeight: 1.6, whiteSpace: 'nowrap',
    }}>
      {serviceLabel(service)}
    </Box>
  );
}

export function NamePage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const c = useColors();

  const [info, setInfo]               = useState<NameInfo | null>(null);
  const [resources, setResources]     = useState<QdnResource[]>([]);
  const [hasMore, setHasMore]         = useState(false);
  const [loadingHead, setLoadingHead] = useState(true);
  const [loadingRes, setLoadingRes]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setLoadingHead(true);
    setLoadingRes(true);
    setError(null);
    setResources([]);

    void fetchNameInfo(name)
      .then(n => { setInfo(n); setLoadingHead(false); })
      .catch(e => { setError(e instanceof Error ? e.message : String(e)); setLoadingHead(false); });

    void fetchQdnResourcesByName(name, RES_LIMIT, 0).then(results => {
      setResources(results);
      setHasMore(results.length === RES_LIMIT);
      setLoadingRes(false);
    });
  }, [name]);

  const loadMore = useCallback(async () => {
    if (!name) return;
    setLoadingMore(true);
    const results = await fetchQdnResourcesByName(name, RES_LIMIT, resources.length);
    setResources(prev => [...prev, ...results]);
    setHasMore(results.length === RES_LIMIT);
    setLoadingMore(false);
  }, [name, resources.length]);

  if (loadingHead && !error) {
    return (
      <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={28} sx={{ color: c.accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: `${tokens.spacing.topBarHeight + 24}px`, pb: 4, px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
        <Typography sx={{ color: c.error, fontSize: '0.85rem' }}>{error}</Typography>
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

      {/* Name header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>
          Name
        </Typography>
        <Typography sx={{ fontSize: '1.4rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary, letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
          {name}
        </Typography>
      </Box>

      {/* Stats */}
      {info && (
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 140 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Owner</Typography>
            <Typography
              onClick={() => navigate(`/address/${info.owner}`)}
              sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: c.accent, cursor: 'pointer', wordBreak: 'break-all', '&:hover': { color: c.accentHover } }}
            >
              {info.owner}
            </Typography>
          </Box>
          {info.registered != null && (
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 140 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>Registered</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: c.textPrimary }}>{formatDate(info.registered)}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary }}>{formatAge(info.registered)}</Typography>
            </Box>
          )}
          {info.isForSale && (
            <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>For Sale</Typography>
              <Chip label={info.salePrice ? `${info.salePrice} QORT` : 'Yes'} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${c.success}22`, color: c.success, border: `1px solid ${c.success}44` }} />
            </Box>
          )}
          <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, p: 2, flex: 1, minWidth: 120 }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 0.5 }}>QDN Resources</Typography>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: tokens.typography.weightBlack, color: c.textPrimary }}>
              {loadingRes ? '…' : resources.length + (hasMore ? '+' : '')}
            </Typography>
          </Box>
        </Box>
      )}

      {/* QDN Resources */}
      <Typography sx={{ fontSize: '0.65rem', fontWeight: tokens.typography.weightBold, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.textSecondary, mb: 1.5 }}>
        QDN Resources
      </Typography>

      <Box sx={{ border: `${tokens.shape.borderWidth} solid ${c.borderLight}`, borderRadius: `${tokens.shape.radius}px`, bgcolor: c.surface, overflow: 'hidden', mb: 2 }}>
        {loadingRes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={20} sx={{ color: c.accent }} />
          </Box>
        ) : resources.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography sx={{ fontSize: '0.85rem', color: c.textSecondary }}>No QDN resources found.</Typography>
          </Box>
        ) : (
          resources.map((r, i) => <ResourceRow key={`${r.service}-${r.identifier}-${i}`} resource={r} />)
        )}
      </Box>

      {hasMore && !loadingRes && (
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

function ResourceRow({ resource: r }: { resource: QdnResource }) {
  const c = useColors();
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 1.5, flexWrap: 'wrap',
      borderBottom: `1px solid ${c.borderLight}`, '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ flex: '0 0 auto', minWidth: 90 }}>
        <ServiceBadge service={r.service} />
      </Box>
      <Typography sx={{ flex: 1, fontSize: '0.82rem', color: c.textPrimary, wordBreak: 'break-all', minWidth: 80 }}>
        {r.identifier || <span style={{ color: c.textSecondary, fontStyle: 'italic' }}>default</span>}
      </Typography>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        {r.size != null && (
          <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary }}>{r.size.toLocaleString()} B</Typography>
        )}
        {(r.updated ?? r.created) != null && (
          <Typography sx={{ fontSize: '0.65rem', color: c.textSecondary }}>{formatAge(r.updated ?? r.created)}</Typography>
        )}
      </Box>
    </Box>
  );
}
