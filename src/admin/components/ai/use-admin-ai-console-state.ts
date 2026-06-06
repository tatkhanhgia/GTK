'use client'

import { useEffect, useState } from 'react'
import type { AdminAiAttachment, AdminAiSafeProfile } from '@/lib/admin-ai/admin-ai-chat-contract'
import {
  deleteAdminAiFile,
  fetchAdminAiProfiles,
  runAdminAiAction,
  sendAdminAiChat,
  updateAdminAiSessionMessages,
  uploadAdminAiFile,
} from './admin-ai-console-api-client'
import { initialMessages } from './admin-ai-initial-messages'
import type { AdminAiMessage } from './admin-ai-message-list'
import { useAdminAiSessions } from './use-admin-ai-sessions'

export function useAdminAiConsoleState() {
  const [messages, setMessages] = useState(initialMessages)
  const [profiles, setProfiles] = useState<AdminAiSafeProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<AdminAiAttachment[]>([])
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const [busyActionId, setBusyActionId] = useState<string | null>(null)
  const sessionState = useAdminAiSessions({
    setError,
    setMessages,
    setSelectedProfileId,
    setSelectedModel,
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfiles() {
      try {
        const nextProfiles = await fetchAdminAiProfiles()
        if (cancelled) return
        setProfiles(nextProfiles)
        setSelectedProfileId(nextProfiles[0]?.id ?? '')
        setSelectedModel(nextProfiles[0]?.defaultModel ?? '')
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Không tải được AI profiles.')
      } finally {
        if (!cancelled) setIsLoadingProfiles(false)
      }
    }

    loadProfiles()
    return () => {
      cancelled = true
    }
  }, [])

  const changeProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId)
    setSelectedProfileId(profileId)
    setSelectedModel(profile?.defaultModel ?? '')
  }

  const submitMessage = async (message: string) => {
    if (!selectedProfileId || isBusy) return
    setIsBusy(true)
    setError(null)

    const readyAttachments = selectedAttachments.filter((item) => item.status === 'ready')
    const userMessage: AdminAiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      body: message,
      attachments: readyAttachments,
    }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)

    try {
      const chat = await sendAdminAiChat({
        profileId: selectedProfileId,
        model: selectedModel || undefined,
        sessionId: sessionState.activeSessionId || undefined,
        messages: nextMessages.map((item) => ({
          role: item.role,
          content: item.body,
          attachmentIds: item.attachments?.map((attachment) => attachment.referenceId),
        })),
      })
      if (chat.sessionId) sessionState.setActiveSessionId(chat.sessionId)
      if (chat.session) sessionState.upsertSession(chat.session)
      setSelectedAttachments([])
      setUploadError(null)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          body: chat.message.content || 'Đã nhận phản hồi từ provider.',
          pendingActions: chat.pendingActions,
          toolResults: chat.toolResults,
          status: chat.toolResults?.length ? 'read' : undefined,
        },
      ])
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Không gửi được tin nhắn.')
    } finally {
      setIsBusy(false)
    }
  }

  const uploadFile = async (file: File) => {
    const allowed = ['.md', '.markdown', '.html', '.htm', '.txt']
    const lowerName = file.name.toLowerCase()
    if (!allowed.some((extension) => lowerName.endsWith(extension))) {
      setUploadError('Chỉ hỗ trợ .md, .html, .txt.')
      return
    }

    setIsUploadingFile(true)
    setUploadError(null)
    try {
      const result = await uploadAdminAiFile(file, sessionState.activeSessionId || undefined)
      setSelectedAttachments((current) => [...current, result.attachment])
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : 'Không upload được file.')
    } finally {
      setIsUploadingFile(false)
    }
  }

  const removeSelectedAttachment = async (referenceId: string) => {
    setSelectedAttachments((current) => current.filter((item) => item.referenceId !== referenceId))
    try {
      await deleteAdminAiFile(referenceId)
    } catch (deleteError) {
      setUploadError(deleteError instanceof Error ? deleteError.message : 'Không xóa được file AI.')
    }
  }

  const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
    setBusyActionId(id)
    setError(null)
    try {
      await runAdminAiAction(id, action)
      const nextMessages = [
        ...messages.map((message) => ({
          ...message,
          pendingActions: message.pendingActions?.filter((pending) => pending.id !== id),
        })),
        {
          id: `action-${Date.now()}`,
          role: 'assistant',
          body: action === 'confirm' ? 'Hành động đã được duyệt và thực thi.' : 'Hành động đã bị hủy.',
        },
      ] satisfies AdminAiMessage[]
      setMessages(nextMessages)
      if (sessionState.activeSessionId) {
        const session = await updateAdminAiSessionMessages(sessionState.activeSessionId, nextMessages)
        sessionState.upsertSession(session)
      }
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Không xử lý được hành động.')
    } finally {
      setBusyActionId(null)
    }
  }

  return {
    messages,
    profiles,
    sessions: sessionState.sessions,
    activeSessionId: sessionState.activeSessionId,
    selectedProfileId,
    selectedModel,
    error,
    isBusy,
    selectedAttachments,
    isUploadingFile,
    uploadError,
    isLoadingProfiles,
    isLoadingSessions: sessionState.isLoadingSessions,
    busyActionId,
    busySessionId: sessionState.busySessionId,
    composerDisabled: isLoadingProfiles || profiles.length === 0 || !selectedProfileId,
    setSelectedModel,
    changeProfile,
    submitMessage,
    uploadFile,
    removeSelectedAttachment,
    createSession: sessionState.createSession,
    openSession: sessionState.openSession,
    deleteSession: sessionState.deleteSession,
    handleAction,
  }
}
