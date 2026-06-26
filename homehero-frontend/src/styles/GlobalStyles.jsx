import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #e0e0e0; }
  a { text-decoration: none; }
`;
