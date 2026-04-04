'use client'

import { useState, useTransition } from 'react'
import { useSession } from '@/lib/auth/auth-client'
import { createComment, deleteComment } from '@/lib/blog/comments-actions'
import { formatDate } from '@/lib/utils'
import { Trash2, Reply, MessageCircle } from 'lucide-react'

interface Comment {
  id: string
  userId: string
  content: string
  parentId: string | null
  createdAt: string
  userName?: string
}

interface Props {
  postId: string
  locale?: string
}

/**
 * Threaded comment section for blog posts.
 * Supports top-level comments and one level of replies.
 * Requires authentication; uses optimistic UI updates via server actions.
 */
export function CommentSection({ postId, locale = 'vi' }: Props) {
  const { data: session } = useSession()
  const isVi = locale === 'vi'
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !session) return
    setError('')

    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      userId: session.user.id,
      content: text.trim(),
      parentId: replyTo,
      createdAt: new Date().toISOString(),
      userName: session.user.name,
    }

    // Optimistically append; roll back on failure
    setComments((prev) => [...prev, optimistic])
    setText('')
    setReplyTo(null)

    startTransition(async () => {
      try {
        await createComment(postId, optimistic.content, replyTo ?? undefined)
      } catch {
        setError(
          isVi ? 'Không thể đăng bình luận.' : 'Failed to post comment.'
        )
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      }
    })
  }

  function handleDelete(id: string) {
    // Optimistically remove from UI; server action runs in background
    setComments((prev) => prev.filter((c) => c.id !== id))
    startTransition(async () => {
      try {
        await deleteComment(id)
      } catch {
        // Comment already removed from UI; log silently in production
        console.error('Failed to delete comment', id)
      }
    })
  }

  const topLevel = comments.filter((c) => !c.parentId)
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId)

  return (
    <div>
      <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        {isVi
          ? `Bình luận (${comments.length})`
          : `Comments (${comments.length})`}
      </h2>

      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
              <Reply className="h-3.5 w-3.5" />
              {isVi ? 'Đang trả lời...' : 'Replying to...'}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-primary hover:underline ml-1"
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
            </div>
          )}
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isVi ? 'Viết bình luận...' : 'Write a comment...'}
            rows={3}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!text.trim() || isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isVi ? 'Gửi' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted-foreground p-4 rounded-lg bg-secondary">
          {isVi ? 'Đăng nhập để bình luận.' : 'Login to comment.'}{' '}
          <a href="/login" className="text-primary hover:underline">
            {isVi ? 'Đăng nhập' : 'Login'}
          </a>
        </p>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          {isVi
            ? 'Chưa có bình luận. Hãy là người đầu tiên!'
            : 'No comments yet. Be the first!'}
        </p>
      ) : (
        <ul className="space-y-4">
          {topLevel.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {comment.userName ?? 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt, locale)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {session && (
                    <button
                      type="button"
                      onClick={() => setReplyTo(comment.id)}
                      className="p-1.5 rounded hover:bg-secondary transition-colors"
                      aria-label={isVi ? 'Trả lời' : 'Reply'}
                    >
                      <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                  {session &&
                    (session.user.id === comment.userId ||
                      session.user.role === 'admin') && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                        aria-label={isVi ? 'Xóa' : 'Delete'}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                </div>
              </div>

              {/* Nested replies */}
              {getReplies(comment.id).length > 0 && (
                <ul className="mt-4 pl-4 border-l-2 border-border space-y-3">
                  {getReplies(comment.id).map((reply) => (
                    <li key={reply.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {reply.userName ?? 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reply.createdAt, locale)}
                        </span>
                      </div>
                      <p>{reply.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
