'use client'

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { AdminAiSessionDetail } from '@/lib/admin-ai/admin-ai-chat-contract'
import {
  createAdminAiSession,
  deleteAdminAiSession,
  fetchAdminAiSession,
  fetchAdminAiSessions,
} from './admin-ai-console-api-client'
import { initialMessages } from './admin-ai-initial-messages'
import type { AdminAiMessage } from './admin-ai-message-list'

type Args = {
  setError: (message: string | null) => void
  setMessages: Dispatch<SetStateAction<AdminAiMessage[]>>
  setSelectedProfileId: (profileId: string) => void
  setSelectedModel: (model: string) => void
}

export function useAdminAiSessions({
  setError,
  setMessages,
  setSelectedProfileId,
  setSelectedModel,
}: Args) {
  const [sessions, setSessions] = useState<AdminAiSessionDetail[]>([])
  const [activeSessionId, setActiveSessionId] = useState('')
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [busySessionId, setBusySessionId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSessions() {
      try {
        const nextSessions = await fetchAdminAiSessions()
        if (!cancelled) setSessions(nextSessions)
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Không tải được session AI.')
      } finally {
        if (!cancelled) setIsLoadingSessions(false)
      }
    }

    loadSessions()
    return () => {
      cancelled = true
    }
  }, [setError])

  const upsertSession = (session: AdminAiSessionDetail) => {
    setSessions((current) => [session, ...current.filter((item) => item.id !== session.id)])
  }

  const createSession = async () => {
    setBusySessionId('new')
    setError(null)
    try {
      const session = await createAdminAiSession()
      upsertSession(session)
      setActiveSessionId(session.id)
      setMessages(initialMessages)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Không tạo được session.')
    } finally {
      setBusySessionId(null)
    }
  }

  const openSession = async (id: string) => {
    setBusySessionId(id)
    setError(null)
    try {
      const session = await fetchAdminAiSession(id)
      setActiveSessionId(session.id)
      setMessages(session.messages.length ? session.messages : initialMessages)
      if (session.profileId) setSelectedProfileId(session.profileId)
      if (session.model) setSelectedModel(session.model)
      upsertSession(session)
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Không mở được session.')
    } finally {
      setBusySessionId(null)
    }
  }

  const deleteSession = async (id: string) => {
    if (!window.confirm('Xóa session AI này? Hành động này không thể hoàn tác.')) return
    setBusySessionId(id)
    setError(null)
    try {
      await deleteAdminAiSession(id)
      setSessions((current) => current.filter((session) => session.id !== id))
      if (activeSessionId === id) {
        setActiveSessionId('')
        setMessages(initialMessages)
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Không xóa được session.')
    } finally {
      setBusySessionId(null)
    }
  }

  return {
    sessions,
    activeSessionId,
    isLoadingSessions,
    busySessionId,
    setActiveSessionId,
    upsertSession,
    createSession,
    openSession,
    deleteSession,
  }
}
