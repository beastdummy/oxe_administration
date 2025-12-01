import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { QuickAdmin } from '../components/QuickAdmin'
import { TabletDashboard } from '../components/TabletDashboard'
import { isInGame } from '../nui'

export const Route = createFileRoute('/')({
  component: AdminRoot,
})

type ViewMode = 'quick' | 'tablet'

function AdminRoot() {
  const [mode, setMode] = useState<ViewMode>('quick')
  const [visible, setVisible] = useState(() => !isInGame())

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

  // Escuchamos los mensajes NUI desde client/main.lua para mostrar / ocultar el panel
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { action, data, mode: incomingMode } = event.data || {}

      if (action === 'setVisible') {
        setVisible(Boolean(data))

        if (incomingMode === 'quick' || incomingMode === 'tablet') {
          setMode(incomingMode)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!visible) {
    return null
  }

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
