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
  const [copiedText, setCopiedText] = useState<string | null>(null)

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

      if (action === 'coordsCopied' && typeof data === 'string') {
        setCopiedText(data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!copiedText) return

    const timeout = window.setTimeout(() => setCopiedText(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [copiedText])

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

      {copiedText && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg border shadow-lg text-sm"
          style={{
            backgroundColor: 'var(--oxe-surface)',
            borderColor: 'var(--oxe-border)',
            color: 'var(--oxe-text)',
          }}
        >
          Coordenadas copiadas: {copiedText}
        </div>
      )}

      {/* Ayuda abajo izquierda */}
    </div>
  )
}

export default AdminRoot
