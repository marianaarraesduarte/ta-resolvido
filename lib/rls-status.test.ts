import { describe, expect, it } from "vitest";
import { fetchRlsStatus } from "./rls-status";

// Esse teste conversa com o Supabase de verdade (só lê metadados de schema,
// nenhum dado de usuário) — precisa da migration 0009 rodada e das
// credenciais em .env.local. Os outros testes do projeto não dependem de
// rede nem de banco.
describe("RLS — segurança do banco", () => {
  it("toda tabela pública tem RLS ligado e pelo menos uma política", async () => {
    const tables = await fetchRlsStatus();

    expect(tables.length).toBeGreaterThan(0);

    for (const t of tables) {
      expect(t.rls_enabled, `${t.table_name} está com RLS desligado`).toBe(true);
      expect(
        t.policy_count,
        `${t.table_name} tem RLS ligado mas nenhuma política — na prática, ninguém consegue ler nem escrever nada`,
      ).toBeGreaterThan(0);
    }
  });
});
