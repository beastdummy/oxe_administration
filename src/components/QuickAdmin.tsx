import React, { useEffect, useMemo, useState } from "react";
import { isInGame, nuiFetch } from "@/nui.ts";


export interface QuickAdminProps {
  onOpenTablet: () => void;
}

interface QuickActionVariant {
  id: string;
  label: string;
  description: string;
  payload?: unknown;
}

interface QuickActionGroup {
  id: string;
  label: string;
  description: string;
  variants: QuickActionVariant[];
}

const QUICK_GROUPS: QuickActionGroup[] = [
  {
    id: "self",
    label: "Jugador",
    description: "Acciones sobre tu propio personaje.",
    variants: [
      {
        id: "self_noclip",
        label: "Noclip",
        description: "Activar o desactivar noclip para moverte sin colisiones.",
      },
      {
        id: "self_godmode",
        label: "Godmode",
        description: "Modo invencible: sin daño, ideal para moderar.",
      },
      {
        id: "self_invisible",
        label: "Invisibilidad",
        description: "Ocultarte visualmente para otros jugadores.",
      },
      {
        id: "self_heal",
        label: "Curar / Revivir",
        description: "Curarte por completo o levantarte si estás muerto.",
      },
      {
        id: "self_clear_blood",
        label: "Limpiar sangre",
        description: "Quitar sangre, suciedad y efectos visuales.",
      },
      {
        id: "self_clear_inventory",
        label: "Vaciar inventario propio",
        description: "Eliminar todos los ítems de tu inventario.",
      },
      {
        id: "self_admin_weapon",
        label: "Darme arma admin",
        description: "Darte un arma de administración rápida.",
      },
      {
        id: "self_move_speed",
        label: "Velocidad de movimiento",
        description: "Cambiar entre velocidad normal / rápida / muy rápida.",
      },
    ],
  },
  {
    id: "players",
    label: "Jugadores",
    description: "Herramientas para gestionar a otros jugadores.",
    variants: [
      {
        id: "players_spectate",
        label: "Spectate jugador",
        description: "Elegir un jugador para espectear en silencio.",
      },
      {
        id: "players_tp_to",
        label: "TP hacia jugador",
        description: "Teletransportarte directamente a un jugador.",
      },
      {
        id: "players_bring",
        label: "Traer jugador a mí",
        description: "Teletransportar a un jugador hasta tu posición.",
      },
      {
        id: "players_open_inventory",
        label: "Abrir inventario",
        description: "Inspeccionar el inventario del jugador.",
      },
      {
        id: "players_clear_inventory",
        label: "Vaciar inventario",
        description: "Eliminar todos los ítems del jugador.",
      },
      {
        id: "players_freeze",
        label: "Freeze / Unfreeze",
        description: "Congelar o desbloquear movimiento del jugador.",
      },
      {
        id: "players_jail",
        label: "Enviar a jail",
        description: "Enviar a una cárcel o zona de sanción.",
      },
      {
        id: "players_kick",
        label: "Kick rápido",
        description: "Expulsar al jugador del servidor con motivo corto.",
      },
      {
        id: "players_ban",
        label: "Ban rápido",
        description: "Banear al jugador usando una plantilla rápida.",
      },
    ],
  },
  {
    id: "teleport",
    label: "Teleport / Coords",
    description: "Movimiento rápido y utilidades de coordenadas.",
    variants: [
      {
        id: "tp_waypoint",
        label: "TP a waypoint",
        description: "Teletransportarte al marcador del mapa.",
      },
      {
        id: "tp_coords",
        label: "TP a coordenadas",
        description: "Ir a unas coordenadas concretas (x, y, z).",
      },
      {
        id: "coords_copy_vec3",
        label: "Copiar coords (vec3)",
        description: "Copiar tus coords como vector3 (x, y, z).",
      },
      {
        id: "coords_copy_vec4",
        label: "Copiar coords (vec4)",
        description: "Copiar tus coords como vector4 (x, y, z, heading).",
      },
    ],
  },
  {
    id: "vehicles",
    label: "Vehículos",
    description: "Control rápido de vehículos para administración.",
    variants: [
      {
        id: "veh_spawn",
        label: "Spawnear vehículo",
        description: "Spawnear un vehículo admin en tu posición.",
      },
      {
        id: "veh_fix",
        label: "Reparar vehículo",
        description: "Reparar y enderezar el vehículo actual.",
      },
      {
        id: "veh_clean",
        label: "Limpiar / lavar",
        description: "Limpiar suciedad y daños visuales.",
      },
      {
        id: "veh_delete",
        label: "Borrar vehículo",
        description: "Eliminar el vehículo que estás usando o mirando.",
      },
      {
        id: "veh_give_keys",
        label: "Dar llaves",
        description: "Darte llaves del vehículo actual (según sistema).",
      },
      {
        id: "veh_fuel_max",
        label: "Llenar combustible",
        description: "Rellenar el depósito al máximo.",
      },
      {
        id: "veh_flip",
        label: "Volcar / enderezar",
        description: "Girar un vehículo volcado a posición correcta.",
      },
    ],
  },
  {
    id: "server",
    label: "Servidor",
    description: "Opciones globales de tiempo, clima y mantenimiento.",
    variants: [
      {
        id: "srv_time_cycle",
        label: "Cambiar hora",
        description: "Ciclar entre mañana / tarde / noche.",
      },
      {
        id: "srv_weather_cycle",
        label: "Cambiar clima",
        description: "Cambiar entre varios tipos de clima.",
      },
      {
        id: "srv_freeze_time",
        label: "Congelar hora",
        description: "Pausar o reanudar el avance del tiempo.",
      },
      {
        id: "srv_freeze_weather",
        label: "Congelar clima",
        description: "Mantener el clima actual de forma fija.",
      },
      {
        id: "srv_announce",
        label: "Anuncio global",
        description: "Enviar un mensaje a todo el servidor.",
      },
      {
        id: "srv_cleanup",
        label: "Limpiar mundo",
        description: "Eliminar vehículos y cadáveres abandonados.",
      },
    ],
  },
  {
    id: "props",
    label: "Objetos / Props",
    description: "Spawnear y editar objetos en el mundo.",
    variants: [
      {
        id: "props_spawn",
        label: "Spawnear prop",
        description: "Crear un prop por nombre de modelo.",
      },
      {
        id: "props_edit",
        label: "Modo edición",
        description: "Mover, rotar y ajustar un prop existente.",
      },
      {
        id: "props_delete",
        label: "Borrar prop",
        description: "Eliminar el prop que estés apuntando.",
      },
      {
        id: "props_duplicate",
        label: "Duplicar prop",
        description: "Crear una copia del prop seleccionado.",
      },
    ],
  },
];

type ModalState =
  | { type: "tp_coords"; group: QuickActionGroup; variant: QuickActionVariant }
  | { type: "announce"; group: QuickActionGroup; variant: QuickActionVariant };

export const QuickAdmin: React.FC<QuickAdminProps> = ({ onOpenTablet }) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [coordsForm, setCoordsForm] = useState({ x: "", y: "", z: "" });
  const [announceText, setAnnounceText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const currentGroup = QUICK_GROUPS[selectedGroupIndex];
  const currentVariant =
    currentGroup?.variants[selectedVariantIndex] ?? currentGroup?.variants[0];

  const modalTitle = useMemo(() => {
    if (!modal) return "";
    return modal.type === "tp_coords"
      ? "Teletransportar a coordenadas"
      : "Anuncio global";
  }, [modal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modal) {
        if (e.key === "Escape") {
          e.preventDefault();
          setModal(null);
          setFormError(null);
        }
        return;
      }

      // ↑ / ↓ grupos
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedGroupIndex((prev) => {
          const next = prev + 1 >= QUICK_GROUPS.length ? 0 : prev + 1;
          setSelectedVariantIndex(0);
          return next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedGroupIndex((prev) => {
          const next = prev - 1 < 0 ? QUICK_GROUPS.length - 1 : prev - 1;
          setSelectedVariantIndex(0);
          return next;
        });
      }

      // ← / → variantes
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedVariantIndex((prev) => {
          if (!currentGroup) return 0;
          const total = currentGroup.variants.length;
          return prev + 1 >= total ? 0 : prev + 1;
        });
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedVariantIndex((prev) => {
          if (!currentGroup) return 0;
          const total = currentGroup.variants.length;
          return prev - 1 < 0 ? total - 1 : prev - 1;
        });
      }

      // Enter = ejecutar
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentGroup && currentVariant) {
          handleQuickAction(currentGroup, currentVariant);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGroup, currentVariant, modal]);

  const handleQuickAction = (
    group: QuickActionGroup,
    variant: QuickActionVariant
  ) => {
    if (variant.id === "tp_coords") {
      setCoordsForm({ x: "", y: "", z: "" });
      setFormError(null);
      setModal({ type: "tp_coords", group, variant });
      return;
    }

    if (variant.id === "srv_announce") {
      setAnnounceText("");
      setFormError(null);
      setModal({ type: "announce", group, variant });
      return;
    }

    // DEV: en navegador solo log
    if (!isInGame()) {
      console.log("[QuickAdmin DEV] Acción:", group.id, "→", variant.id);
      return;
    }

    // FiveM: mandamos NUI callback
    nuiFetch("quickAction", {
      groupId: group.id,
      variantId: variant.id,
      payload: variant.payload,
    }).catch((err) => {
      console.error("[QuickAdmin] Error enviando quickAction NUI:", err);
    });
  };

  const submitActionWithPayload = (payload: unknown) => {
    if (!modal) return;

    if (!isInGame()) {
      console.log(
        "[QuickAdmin DEV] Acción con payload:",
        modal.group.id,
        "→",
        modal.variant.id,
        payload,
      );
      setModal(null);
      return;
    }

    fetch(`https://oxe_administration/quickAction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        groupId: modal.group.id,
        actionId: modal.variant.id,
        payload,
      }),
    })
      .then(() => {
        setModal(null);
      })
      .catch((err) => {
        console.error("[QuickAdmin] Error enviando quickAction NUI:", err);
      });
  };

  const handleSubmitCoords = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const x = parseFloat(coordsForm.x);
    const y = parseFloat(coordsForm.y);
    const z = parseFloat(coordsForm.z);

    if ([x, y, z].some((value) => Number.isNaN(value))) {
      setFormError("Introduce valores numéricos válidos para X, Y y Z.");
      return;
    }

    submitActionWithPayload({ x, y, z });
  };

  const handleSubmitAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const text = announceText.trim();
    if (!text) {
      setFormError("Escribe un mensaje para anunciar.");
      return;
    }

    submitActionWithPayload({ text });
  };

  return (
    <div
      className="fixed top-1/2 right-8 -translate-y-1/2 w-80 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden pointer-events-auto border"
      style={{
        backgroundColor: "var(--oxe-surface)",
        borderColor: "var(--oxe-border)",
        color: "var(--oxe-text)",
      }}
    >
      {/* HEADER */}
      <div
        className="px-4 py-4 flex items-center justify-between gap-3 border-b"
        style={{
          borderColor: "var(--oxe-border)",
          backgroundColor: "var(--oxe-surface-elevated)",
        }}
      >
        <div className="flex flex-col gap-0.5">
          <div
            className="text-[17px] uppercase tracking-[0.22em]"
            style={{ color: "var(--oxe-text-muted)" }}
          >
            Quick Admin
          </div>
          <div
            className="text-[11px] font-semibold"
            style={{ color: "var(--oxe-text)" }}
          >
            Menú rápido
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenTablet}
          className="flex flex-col items-end gap-1 text-[10px]"
          style={{ color: "var(--oxe-text-soft)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--oxe-accent)" }}
            />
            <span
              className="text-[11px]"
              style={{ color: "var(--oxe-text)" }}
            >
              Modo Quick
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-mono border px-1.5 py-0.5 rounded-full text-[10px]"
              style={{
                borderColor: "var(--oxe-border)",
                backgroundColor: "var(--oxe-surface-elevated)",
                color: "var(--oxe-text)",
              }}
            >
              TAB
            </span>
            <span className="hidden sm:inline">Modo tablet</span>
          </div>
        </button>
      </div>

      {/* LISTA DE GRUPOS */}
      <ul className="max-h-[420px] overflow-y-auto py-1">
        {QUICK_GROUPS.map((group, index) => {
          const active = index === selectedGroupIndex;
          const effectiveVariant =
            active && currentVariant ? currentVariant : group.variants[0];

          const bgColor = active
            ? "var(--oxe-sidebar-active)"
            : "transparent";
          const textColor = active
            ? "var(--oxe-text)"
            : "var(--oxe-text-muted)";

          return (
            <li key={group.id}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 text-xs flex flex-col gap-1 transition-colors"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                }}
                onClick={() => {
                  setSelectedGroupIndex(index);
                  setSelectedVariantIndex(0);
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{
                        backgroundColor: active
                          ? "var(--oxe-accent)"
                          : "rgba(148, 163, 184, 0.7)",
                      }}
                    />
                    <span className="font-semibold">{group.label}</span>
                  </div>

                  <div className="text-[10px] font-mono flex items-center gap-1">
                    <span className="opacity-60">&lt;</span>
                    <span
                      className="border rounded px-1.5 py-0.5 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis"
                      style={{
                        borderColor: "var(--oxe-border)",
                        backgroundColor: "var(--oxe-surface-elevated)",
                        color: "var(--oxe-text)",
                      }}
                    >
                      {effectiveVariant.label}
                    </span>
                    <span className="opacity-60">&gt;</span>
                  </div>
                </div>
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: "var(--oxe-text-soft)" }}
                >
                  {effectiveVariant.description || group.description}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      <div
        className="px-3 py-2.5 flex items-center justify-between text-[11px] border-t"
        style={{
          borderColor: "var(--oxe-border)",
          backgroundColor: "var(--oxe-surface-elevated)",
          color: "var(--oxe-text-soft)",
        }}
      >
        <span>
          Conectado como{" "}
          <span style={{ color: "var(--oxe-text)" }}>Admin</span>
        </span>
        <span>
          <span
            className="font-mono border px-1 py-0.5 rounded"
            style={{
              borderColor: "var(--oxe-border)",
              backgroundColor: "var(--oxe-surface-elevated)",
              color: "var(--oxe-text)",
            }}
          >
            ↑ ↓ ← →
          </span>{" "}
          Navegar / Enter ejecutar
        </span>
      </div>

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-4"
            style={{
              backgroundColor: "var(--oxe-surface)",
              borderColor: "var(--oxe-border)",
              color: "var(--oxe-text)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[12px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--oxe-text-muted)" }}
                >
                  Acción avanzada
                </p>
                <h2 className="text-xl font-semibold leading-tight">
                  {modalTitle}
                </h2>
                <p className="text-sm" style={{ color: "var(--oxe-text-soft)" }}>
                  Completa los datos y confirma para ejecutar la acción.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setFormError(null);
                }}
                className="text-sm px-2 py-1 rounded border"
                style={{
                  borderColor: "var(--oxe-border)",
                  color: "var(--oxe-text-soft)",
                }}
              >
                Cerrar
              </button>
            </div>

            {modal.type === "tp_coords" && (
              <form className="space-y-3" onSubmit={handleSubmitCoords}>
                <div className="grid grid-cols-3 gap-3">
                  {(["x", "y", "z"] as const).map((axis) => (
                    <label key={axis} className="text-sm space-y-1">
                      <span className="block text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--oxe-text-muted)" }}>
                        {axis.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={coordsForm[axis]}
                        onChange={(ev) =>
                          setCoordsForm((prev) => ({ ...prev, [axis]: ev.target.value }))
                        }
                        className="w-full px-3 py-2 rounded border bg-transparent text-sm"
                        style={{ borderColor: "var(--oxe-border)", color: "var(--oxe-text)" }}
                        placeholder={axis === "z" ? "Ej: 35.0" : axis === "x" ? "Ej: -1200.5" : "Ej: 2550.2"}
                        autoFocus={axis === "x"}
                      />
                    </label>
                  ))}
                </div>

                {formError && (
                  <p className="text-sm" style={{ color: "var(--oxe-accent)" }}>
                    {formError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(null);
                      setFormError(null);
                    }}
                    className="px-4 py-2 rounded border text-sm"
                    style={{ borderColor: "var(--oxe-border)", color: "var(--oxe-text-soft)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded border text-sm font-semibold"
                    style={{
                      borderColor: "var(--oxe-accent)",
                      backgroundColor: "var(--oxe-accent)",
                      color: "#0B1120",
                    }}
                  >
                    Teletransportar
                  </button>
                </div>
              </form>
            )}

            {modal.type === "announce" && (
              <form className="space-y-3" onSubmit={handleSubmitAnnounce}>
                <label className="text-sm space-y-1 w-full">
                  <span className="block text-[12px] uppercase tracking-[0.12em]" style={{ color: "var(--oxe-text-muted)" }}>
                    Mensaje a anunciar
                  </span>
                  <textarea
                    value={announceText}
                    onChange={(e) => setAnnounceText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded border bg-transparent text-sm resize-none"
                    style={{ borderColor: "var(--oxe-border)", color: "var(--oxe-text)" }}
                    placeholder="Escribe el texto que verán todos los jugadores"
                    autoFocus
                  />
                </label>

                {formError && (
                  <p className="text-sm" style={{ color: "var(--oxe-accent)" }}>
                    {formError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(null);
                      setFormError(null);
                    }}
                    className="px-4 py-2 rounded border text-sm"
                    style={{ borderColor: "var(--oxe-border)", color: "var(--oxe-text-soft)" }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded border text-sm font-semibold"
                    style={{
                      borderColor: "var(--oxe-accent)",
                      backgroundColor: "var(--oxe-accent)",
                      color: "#0B1120",
                    }}
                  >
                    Enviar anuncio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};