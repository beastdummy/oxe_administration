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

  useEffect(() => {
    const copyText = async (text: string) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        setCopiedText(text)
      } catch (error) {
        console.error('[NUI] No se pudo copiar al portapapeles:', error)
      }
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.action === 'copyCoords' && typeof data.text === 'string') {
        copyText(data.text)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!copiedText) return
    const timeout = setTimeout(() => setCopiedText(null), 2500)
    return () => clearTimeout(timeout)
  }, [copiedText])

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
