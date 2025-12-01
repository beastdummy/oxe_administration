import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    // Contenedor raíz para NUI / web
    <div className="h-screen w-screen bg-transparent">
      {/* Aquí se renderizan las rutas hijas (ej: /) */}
      <Outlet />
    </div>
  ),
})

