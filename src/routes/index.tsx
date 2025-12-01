import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { QuickAdmin } from '../components/QuickAdmin'
import { TabletDashboard } from '../components/TabletDashboard'

export const Route = createFileRoute('/')({
  component: AdminRoot,
})

type ViewMode = 'quick' | 'tablet'

function AdminRoot() {
  const [mode, setMode] = useState<ViewMode>('quick')

  // TAB = alternar vistas (Quick / Tablet)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        setMode((prev) => (prev === 'quick' ? 'tablet' : 'quick'))
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="h-screen w-screen bg-transparent text-slate-100">
      {mode === 'tablet' && (
        <TabletDashboard onBackToQuick={() => setMode('quick')} />
      )}

      {mode === 'quick' && (
        <QuickAdmin onOpenTablet={() => setMode('tablet')} />
      )}

      {/* Ayuda abajo izquierda */}
    </div>
  )
}

export default AdminRoot
