import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

// lista-mercado-app e quadro-do-box são atalhos pra outros projetos, criados
// só pra rodar o preview deles daqui. Sem ignorá-los, o tsc e o vitest entram
// nesses diretórios e reprovam por causa de código que não é deste app — e uma
// suíte vermelha por motivo alheio ensina a ignorar vermelho.
const OUTROS_PROJETOS = ["**/lista-mercado-app/**", "**/quadro-do-box/**"];

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    exclude: [...configDefaults.exclude, ...OUTROS_PROJETOS],
  },
});
