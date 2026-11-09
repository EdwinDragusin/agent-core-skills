// scripts/lint-docs.ts
// Lanzador multiplataforma de scripts/doc-linter.ps1.
// Usa PowerShell 7 (pwsh) si esta disponible; en Windows sin pwsh recurre a PowerShell 5.1.
// Uso: deno task lint:docs [-- -Detailed]

const separador = Deno.build.os === "windows" ? "\\" : "/";
const linter = `${import.meta.dirname}${separador}doc-linter.ps1`;

async function existe(cmd: string): Promise<boolean> {
  try {
    const { success } = await new Deno.Command(cmd, {
      args: ["-NoProfile", "-Command", "exit 0"],
      stdout: "null",
      stderr: "null",
    }).output();
    return success;
  } catch {
    return false;
  }
}

const candidatos = Deno.build.os === "windows" ? ["pwsh", "powershell"] : ["pwsh"];
let shell: string | undefined;
for (const c of candidatos) {
  if (await existe(c)) {
    shell = c;
    break;
  }
}

if (!shell) {
  console.error("[ERROR BLOQUEANTE] No se encontro PowerShell (pwsh). Instalar PowerShell 7.");
  Deno.exit(1);
}

const { code } = await new Deno.Command(shell, {
  args: ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", linter, ...Deno.args],
  stdout: "inherit",
  stderr: "inherit",
}).output();

Deno.exit(code);
