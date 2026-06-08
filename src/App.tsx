import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAtom } from 'jotai';
import { lightTheme, darkTheme } from './theme/theme';
import { lightColors, darkColors } from './theme/tokens';
import { ColorTokensContext } from './theme/ColorTokensContext';
import { themeAtom } from './state/atoms';
import { EnumTheme } from './types';
import { AppRoutes } from './routes/Routes';

export function App() {
  const [theme] = useAtom(themeAtom);
  const isDark = theme === EnumTheme.DARK;

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <ColorTokensContext.Provider value={isDark ? darkColors : lightColors}>
        <AppRoutes />
      </ColorTokensContext.Provider>
    </ThemeProvider>
  );
}
