import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Przy budowaniu na GitHub Pages strona ląduje pod adresem
// https://<uzytkownik>.github.io/my-bagpack/ — stąd base na czas builda.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/my-bagpack/' : '/',
  plugins: [react(), tailwindcss()],
}));
