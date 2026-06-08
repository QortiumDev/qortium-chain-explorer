import { atomWithStorage } from 'jotai/utils';
import { EnumTheme } from '../types';

export const themeAtom = atomWithStorage<EnumTheme>('ch-theme', EnumTheme.DARK);
