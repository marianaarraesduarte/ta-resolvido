import { describe, expect, it } from "vitest";
import { fetchRlsStatus, type RlsStatusRow } from "./rls-status";

// Esse teste conversa com o Supabase de verdade (só lê metadados de schema,
// nenhum dado de usuária) — precisa das migrations 0009 e 0011 rodadas e das
// credenciais em .env.local. Os outros testes do projeto não dependem de
// rede nem de banco.
describe("RLS — segurança do banco", () => {
  it("toda tabela pública tem RLS ligado, com política, e a política trava em auth.uid()", async () => {
    const rows = await fetchRlsStatus();
    expect(rows.length).toBeGreaterThan(0);

    const byTable = new Map<string, RlsStatusRow[]>();
    for (const row of rows) {
      const list = byTable.get(row.table_name) ?? [];
      list.push(row);
      byTable.set(row.table_name, list);
    }

    for (const [table, tableRows] of byTable) {
      expect(tableRows[0].rls_enabled, `${table} está com RLS desligado`).toBe(true);

      const policies = tableRows.filter((r) => r.policy_name);
      expect(
        policies.length,
        `${table} tem RLS ligado mas nenhuma política — na prática, ninguém consegue ler nem escrever nada`,
      ).toBeGreaterThan(0);

      for (const p of policies) {
        expect(
          p.policy_expr?.includes("auth.uid()"),
          `a política "${p.policy_name}" em ${table} não trava em auth.uid() — pode estar aberta demais`,
        ).toBe(true);
      }
    }
  });
});
