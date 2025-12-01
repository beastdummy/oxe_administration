// src/nui.ts

// Detecta si estamos dentro de FiveM (NUI) o en el navegador normal
export function isInGame(): boolean {
  // @ts-ignore - FiveM inyecta esta función en NUI
  return typeof GetParentResourceName === "function";
}

// Helper para hacer peticiones NUI a Lua
export async function nuiFetch<T = unknown>(
  event: string,
  data?: unknown,
): Promise<T | void> {
  if (!isInGame()) {
    // Modo navegador: solo logea para debug
    console.log("[NUI MOCK] ->", event, data);
    return;
  }

  // @ts-ignore
  const resourceName = GetParentResourceName?.() ?? "oxe_administration";

  const res = await fetch(`https://${resourceName}/${event}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data ?? {}),
  });

  try {
    return (await res.json()) as T;
  } catch {
    return;
  }
}
