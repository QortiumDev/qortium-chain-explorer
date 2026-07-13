import { useState, useEffect } from 'react';
import { fetchPrimaryName } from '../api/rest';

const nameCache = new Map<string, string | null>();

export function useAddressName(address: string | undefined): string | null {
  const [name, setName] = useState<string | null>(() => {
    if (!address) return null;
    return nameCache.has(address) ? (nameCache.get(address) ?? null) : null;
  });

  useEffect(() => {
    if (!address) return;
    if (nameCache.has(address)) {
      setName(nameCache.get(address) ?? null);
      return;
    }
    void fetchPrimaryName(address).then(n => {
      nameCache.set(address, n);
      setName(n);
    });
  }, [address]);

  return name;
}
