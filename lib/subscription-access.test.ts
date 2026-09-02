import { describe, expect, it } from "vitest";
import { accessUntilAfterCancel, hasAccessExpired } from "./subscription-access";

const agora = new Date("2026-09-02T12:00:00Z");

describe("accessUntilAfterCancel", () => {
  it("mantém o acesso até a próxima cobrança que não vai mais acontecer", () => {
    const proximaCobranca = new Date("2026-09-28T12:00:00Z");
    expect(accessUntilAfterCancel(proximaCobranca, agora)).toEqual(proximaCobranca);
  });

  it("sem data da Hotmart, cai no prazo de segurança em vez de cortar na hora", () => {
    const resultado = accessUntilAfterCancel(null, agora);
    expect(resultado.getTime()).toBeGreaterThan(agora.getTime());
  });

  it("data já vencida também cai no prazo de segurança", () => {
    // Assinatura atrasada: a próxima cobrança ficou pra trás. Cortar o acesso
    // no passado seria o mesmo que cortar na hora.
    const vencida = new Date("2026-08-20T12:00:00Z");
    const resultado = accessUntilAfterCancel(vencida, agora);
    expect(resultado.getTime()).toBeGreaterThan(agora.getTime());
  });

  it("data inválida cai no prazo de segurança", () => {
    const resultado = accessUntilAfterCancel(new Date("nao-e-data"), agora);
    expect(resultado.getTime()).toBeGreaterThan(agora.getTime());
  });
});

describe("hasAccessExpired", () => {
  it("falso enquanto a data não chegou", () => {
    expect(hasAccessExpired("2026-09-28T12:00:00Z", agora)).toBe(false);
  });

  it("verdadeiro quando a data chegou ou passou", () => {
    expect(hasAccessExpired("2026-09-02T12:00:00Z", agora)).toBe(true);
    expect(hasAccessExpired("2026-08-01T12:00:00Z", agora)).toBe(true);
  });

  it("sem cancelamento agendado, nunca expira", () => {
    expect(hasAccessExpired(null, agora)).toBe(false);
    expect(hasAccessExpired(undefined, agora)).toBe(false);
  });

  it("data inválida não derruba ninguém por acidente", () => {
    expect(hasAccessExpired("qualquer coisa", agora)).toBe(false);
  });
});
