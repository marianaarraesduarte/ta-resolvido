import fs from "node:fs";
import path from "node:path";

// Next.js carrega .env.local sozinho em dev/build, mas os testes rodam fora
// do Next — então carregamos aqui pra quem precisa de credencial (ex: o
// teste de RLS, que conversa com o Supabase de verdade).
const envPath = path.resolve(import.meta.dirname, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2];
    }
  }
}
