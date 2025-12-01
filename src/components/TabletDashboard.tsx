import React, { useState } from "react";
import oxeLogo from "../assets/oxe_logo.png";
import { useThemeToggle } from "../hooks/useThemeToggle";

export interface TabletDashboardProps {
  onBackToQuick: () => void;
}

type Section =
  | "overview"
  | "players"
  | "jobs"
  | "inventory"
  | "vehicles"
  | "doors"
  | "logs";

export const TabletDashboard: React.FC<TabletDashboardProps> = ({
  onBackToQuick,
}) => {
  const [section, setSection] = useState<Section>("overview");
  const { theme, cycleTheme } = useThemeToggle();

  // Texto del botón según el tema actual
  const themeLabel =
    theme === "classic"
      ? "Tema clásico"
      : theme === "neon"
      ? "Tema neón"
      : "Tema blanco";

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto w-[1180px] h-[640px] rounded-[28px] border shadow-[0_32px_120px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden flex"
        style={{
          backgroundColor: "var(--oxe-surface)",
          borderColor: "var(--oxe-border)",
        }}
      >
        {/* SIDEBAR */}
        <aside
          className="w-50 border-r flex flex-col"
          style={{
            backgroundColor: "var(--oxe-sidebar)",
            borderColor: "var(--oxe-border)",
          }}
        >
          <div className="px-3 pt-3 pb-3 border-b flex items-center"
               style={{ borderColor: "var(--oxe-border)" }}>
            <img
              src={oxeLogo}
              alt="OXE Administration"
              className="h-15 w-auto drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
            />
            <span className="sr-only">OXE Administration · Panel ox_core</span>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 text-[13px]">
            <NavItem
              label="Overview"
              active={section === "overview"}
              onClick={() => setSection("overview")}
            />
            <NavItem
              label="Jugadores"
              active={section === "players"}
              onClick={() => setSection("players")}
            />
            <NavItem
              label="Trabajos / Grupos"
              active={section === "jobs"}
              onClick={() => setSection("jobs")}
            />
            <NavItem
              label="Inventario / Ítems"
              active={section === "inventory"}
              onClick={() => setSection("inventory")}
            />
            <NavItem
              label="Vehículos"
              active={section === "vehicles"}
              onClick={() => setSection("vehicles")}
            />
            <NavItem
              label="Puertas"
              active={section === "doors"}
              onClick={() => setSection("doors")}
            />
            <NavItem
              label="Logs / Eventos"
              active={section === "logs"}
              onClick={() => setSection("logs")}
            />
          </nav>

          <div
            className="px-4 py-3 text-[11px] flex items-center justify-between"
            style={{ borderTop: "1px solid var(--oxe-border)", color: "var(--oxe-text-soft)" }}
          >
            <span>
              Conectado como{" "}
              <span className="font-semibold" style={{ color: "var(--oxe-text)" }}>
                Admin
              </span>
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--oxe-accent)" }}
              />
              <span>ox_core</span>
            </span>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col">
          {/* HEADER */}
          <header
            className="h-14 px-5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--oxe-border)", backgroundColor: "var(--oxe-surface)" }}
          >
            <div className="flex flex-col">
              <span className="text-sm" style={{ color: "var(--oxe-text)" }}>
                OXE_ADMINISTRATION &gt;{" "}
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "var(--oxe-text-soft)" }}
              >
                {sectionTitle(section)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              {/* Indicador de modo tablet */}
              <div className="flex items-center gap-2" style={{ color: "var(--oxe-text-soft)" }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--oxe-accent)" }}
                />
                <span>Modo tablet</span>
              </div>

              {/* Botón cambiar tema (cycleTheme) */}
              <button
                type="button"
                onClick={cycleTheme}
                className="flex items-center gap-2 px-2 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: "var(--oxe-border)",
                  backgroundColor: "var(--oxe-surface-elevated)",
                  color: "var(--oxe-text)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--oxe-accent)" }}
                />
                <span className="text-[10px]">
                  {themeLabel}
                </span>
              </button>

              {/* Volver a Quick Admin */}
              <button
                type="button"
                onClick={onBackToQuick}
                className="flex items-center gap-2"
              >
                <span
                  className="font-mono border px-2 py-0.5 rounded-full text-[10px]"
                  style={{
                    borderColor: "var(--oxe-border)",
                    backgroundColor: "var(--oxe-surface-elevated)",
                    color: "var(--oxe-text)",
                  }}
                >
                  TAB
                </span>
                <span style={{ color: "var(--oxe-text-soft)" }}>
                  volver a Quick Admin
                </span>
              </button>
            </div>
          </header>

          {/* BODY */}
          <section className="flex-1 p-4 overflow-hidden">
            <div
              className="w-full h-full rounded-2xl border p-4 overflow-auto"
              style={{
                borderColor: "var(--oxe-border)",
                backgroundColor: "var(--oxe-surface-elevated)",
              }}
            >
              {section === "overview" && <OverviewSection />}
              {section === "players" && <PlayersSection />}
              {section === "jobs" && <JobsSection />}
              {section === "inventory" && <InventorySection />}
              {section === "vehicles" && <VehiclesSection />}
              {section === "doors" && <DoorsSection />}
              {section === "logs" && <LogsSection />}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Componentes de navegación
// ---------------------------------------------------------------------------

interface NavItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors",
      active
        ? "bg-[var(--oxe-sidebar-active)] text-[color:var(--oxe-text)]"
        : "text-[color:var(--oxe-text-muted)] hover:bg-[var(--oxe-sidebar-active)]",
    ].join(" ")}
  >
    <span
      className={[
        "w-1 h-5 rounded-full",
        active ? "bg-[var(--oxe-accent)]" : "bg-slate-600/70",
      ].join(" ")}
    />
    <span className="text-[13px]">{label}</span>
  </button>
);

function sectionTitle(section: Section): string {
  switch (section) {
    case "overview":
      return "Resumen general del servidor";
    case "players":
      return "Gestión de jugadores";
    case "jobs":
      return "Trabajos y grupos";
    case "inventory":
      return "Inventario / Ítems";
    case "vehicles":
      return "Vehículos";
    case "doors":
      return "Puertas y accesos";
    case "logs":
      return "Logs y auditoría";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Secciones (contenido de ejemplo, listo para conectar a la API/NUI)
// ---------------------------------------------------------------------------

const OverviewSection: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Tarjetas top */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Jugadores conectados"
          value="18"
          hint="Slots ocupados ahora mismo"
        />
        <StatCard
          label="Recursos activos"
          value="142"
          hint="Scripts cargados en el servidor"
        />
        <StatCard
          label="Tickrate aprox."
          value="96 Hz"
          hint="Estado general del servidor"
        />
      </div>

      {/* Bloques inferiores */}
      <div className="grid grid-cols-3 gap-3">
        <PanelCard title="Actividad reciente">
          <ul className="text-[11px] text-[color:var(--oxe-text-muted)] space-y-1">
            <li>● Cambios de job, TP, bans, giveitem...</li>
            <li>● Logs rápidos de lo último que ha pasado.</li>
            <li>● Más adelante: datos reales desde la DB / NUI.</li>
          </ul>
        </PanelCard>
        <PanelCard title="Economía">
          <p className="text-[11px] text-[color:var(--oxe-text-muted)]">
            Aquí mostraremos movimientos de dinero, cuentas, sociedades, etc.
          </p>
        </PanelCard>
        <PanelCard title="Seguridad / Errores">
          <p className="text-[11px] text-[color:var(--oxe-text-muted)]">
            Estado de recursos clave, errores recientes, intentos fallidos, etc.
          </p>
        </PanelCard>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
}> = ({ label, value, hint }) => (
  <div className="h-24 rounded-xl border border-[var(--oxe-border)] bg-[var(--oxe-surface-elevated)] px-4 py-3 flex flex-col justify-between">
    <div className="text-[11px] text-[color:var(--oxe-text-soft)]">
      {label}
    </div>
    <div className="text-2xl font-semibold text-[color:var(--oxe-text)]">
      {value}
    </div>
    {hint && (
      <div className="text-[10px] text-[color:var(--oxe-text-muted)]">
        {hint}
      </div>
    )}
  </div>
);

const PanelCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="min-h-[120px] rounded-xl border border-[var(--oxe-border)] bg-[var(--oxe-surface-elevated)] px-4 py-3 flex flex-col gap-2">
    <div className="text-[11px] font-semibold text-[color:var(--oxe-text)]">
      {title}
    </div>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

const PlayersSection: React.FC = () => {
  const players = [
    {
      id: 1,
      name: "pepillo bubba",
      identifier: "NB9567",
      job: "unemployed",
      ping: 42,
      status: "Online",
    },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <div className="text-[12px] text-[color:var(--oxe-text-muted)]">
          Vista previa de jugadores conectados. Más adelante rellenaremos esta
          tabla con datos reales de ox_core / DB.
        </div>
        <div className="text-[11px] text-[color:var(--oxe-text-soft)]">
          Total:{" "}
          <span className="font-semibold text-[color:var(--oxe-text)]">
            {players.length}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-[var(--oxe-border)] bg-[var(--oxe-surface-elevated)] overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-[var(--oxe-sidebar-active)] text-[color:var(--oxe-text-muted)]">
            <tr>
              <th className="px-3 py-2 text-left w-14">ID</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Identifier</th>
              <th className="px-3 py-2 text-left">Job</th>
              <th className="px-3 py-2 text-left w-16">Ping</th>
              <th className="px-3 py-2 text-left w-20">Estado</th>
              <th className="px-3 py-2 text-left w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr
                key={p.id}
                className="border-t border-[var(--oxe-border)] hover:bg-[var(--oxe-sidebar-active)]"
              >
                <td className="px-3 py-2 text-[color:var(--oxe-text-muted)]">
                  {p.id}
                </td>
                <td className="px-3 py-2 text-[color:var(--oxe-text)]">
                  {p.name}
                </td>
                <td className="px-3 py-2 text-[color:var(--oxe-text-muted)]">
                  {p.identifier}
                </td>
                <td className="px-3 py-2 text-[color:var(--oxe-text-muted)]">
                  {p.job}
                </td>
                <td className="px-3 py-2 text-[color:var(--oxe-text-muted)]">
                  {p.ping} ms
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--oxe-accent-soft)] text-[color:var(--oxe-accent)] border border-[var(--oxe-accent)]/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--oxe-accent)]" />
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <TagButton label="Ver" />
                    <TagButton label="TP" />
                    <TagButton label="SetJob" />
                    <TagButton label="Kick" tone="destructive" />
                  </div>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[color:var(--oxe-text-soft)]"
                >
                  No hay jugadores conectados ahora mismo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TagButton: React.FC<{ label: string; tone?: "default" | "destructive" }> =
  ({ label, tone = "default" }) => {
    const base =
      "px-2 py-0.5 rounded-full border text-[10px] cursor-pointer select-none";
    const styles =
      tone === "destructive"
        ? "bg-red-500/10 border-red-500/40 text-red-300"
        : "bg-[var(--oxe-surface)] border-[var(--oxe-border)] text-[color:var(--oxe-text)]";
    return <button className={`${base} ${styles}`}>{label}</button>;
  };

// ---------------------------------------------------------------------------
// Secciones placeholder
// ---------------------------------------------------------------------------

const JobsSection: React.FC = () => (
  <PlaceholderSection
    title="Trabajos / Grupos"
    text="Aquí mostraremos los jobs de ox_core, grupos, rangos y herramientas rápidas para cambiar trabajo, ascender, degradar, etc."
  />
);

const InventorySection: React.FC = () => (
  <PlaceholderSection
    title="Inventario / Ítems"
    text="Vista de inventarios, búsqueda de ítems por nombre y herramientas para giveitem / removeitem usando ox_inventory."
  />
);

const VehiclesSection: React.FC = () => (
  <PlaceholderSection
    title="Vehículos"
    text="Gestión de vehículos: buscar por matrícula, dueño, job, ver estado de garajes, impound, etc."
  />
);

const DoorsSection: React.FC = () => (
  <PlaceholderSection
    title="Puertas / accesos"
    text="Configuración de puertas, estados (cerrado / abierto / forzado), grupos con acceso, etc."
  />
);

const LogsSection: React.FC = () => (
  <PlaceholderSection
    title="Logs y auditoría"
    text="Resumen de logs: acciones admin, economía, seguridad, errores, todo conectado con tu tabla oxe_admin_logs."
  />
);

const PlaceholderSection: React.FC<{ title: string; text: string }> = ({
  title,
  text,
}) => (
  <div className="flex flex-col gap-3 h-full">
    <div className="text-[13px] font-semibold text-[color:var(--oxe-text)]">
      {title}
    </div>
    <div className="text-[12px] text-[color:var(--oxe-text-muted)] max-w-2xl">
      {text}
    </div>
    <div className="mt-2 text-[11px] text-[color:var(--oxe-text-soft)]">
      Más adelante aquí meteremos tablas, gráficos y acciones reales conectadas
      al servidor.
    </div>
  </div>
);
