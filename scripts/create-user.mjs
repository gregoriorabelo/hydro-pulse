import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";

const [, , email, password, role = "admin"] = process.argv;

if (!email || !password) {
  console.error("Uso: node scripts/create-user.mjs <email> <senha> [admin|operador]");
  process.exit(1);
}

if (role !== "admin" && role !== "operador") {
  console.error('Papel inválido. Use "admin" ou "operador".');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Defina DATABASE_URL antes de rodar este script.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await hash(password, 12);

await sql`
  insert into users (email, password_hash, role)
  values (${email}, ${passwordHash}, ${role})
  on conflict (email) do update set password_hash = excluded.password_hash, role = excluded.role
`;

console.log(`Usuário ${email} (${role}) criado/atualizado com sucesso.`);
