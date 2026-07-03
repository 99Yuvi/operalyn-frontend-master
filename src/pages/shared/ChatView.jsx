import { useEffect, useLayoutEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'

// Lazy-loaded so the emoji data (~large) doesn't bloat the main bundle —
// it downloads only the first time the user opens the picker
const EmojiPicker = lazy(() => import('emoji-picker-react'))
import { useAuth } from '@/contexts/AuthContext'
import { useConversation } from '@/hooks/useConversation'
import { getConversation, getMessages, markConversationRead, uploadChatFile } from '@/api/conversations'
import { conversationKeys } from '@/lib/queryKeys'
import { cn, getInitials, getAvatarColor, timeAgo } from '@/lib/utils'

/* ── File attachment config ─────────────────────────────────────────────── */
const ACCEPTED_EXTENSIONS = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  file:  [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
}

const MAX_BYTES = { image: 6 * 1024 * 1024, video: 20 * 1024 * 1024, file: 25 * 1024 * 1024 }
const MAX_LABEL = { image: '6 MB', video: '20 MB', file: '25 MB' }

const MEDIA_ACCEPT = [...ACCEPTED_EXTENSIONS.image, ...ACCEPTED_EXTENSIONS.video].join(',')
const DOC_ACCEPT   = ACCEPTED_EXTENSIONS.file.join(',')

function detectType(mimeType) {
  if (ACCEPTED_EXTENSIONS.image.includes(mimeType)) return 'image'
  if (ACCEPTED_EXTENSIONS.video.includes(mimeType)) return 'video'
  return 'file'
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function ChatView() {
  const { conversationId }  = useParams()
  const { user }            = useAuth()
  const scrollRef           = useRef(null)
  const inputRef            = useRef(null)
  const mediaInputRef       = useRef(null)   // image + video picker
  const docInputRef         = useRef(null)   // document picker
  const attachMenuRef       = useRef(null)
  const emojiMenuRef        = useRef(null)
  const isFirstScroll       = useRef(true)
  const blobUrlsRef         = useRef(new Map())   // tempId → blobUrl for cleanup

  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [pendingMsgs, setPending] = useState([])
  const [filePreview, setFilePreview] = useState(null)   // { file, blobUrl, type, name, size }
  const [attachOpen, setAttachOpen]   = useState(false)
  const [emojiOpen, setEmojiOpen]     = useState(false)

  // Close attach / emoji menus on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) setAttachOpen(false)
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(e.target)) setEmojiOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const clearFilePreview = useCallback(() => {
    if (filePreview?.blobUrl) URL.revokeObjectURL(filePreview.blobUrl)
    setFilePreview(null)
  }, [filePreview])

  const revokeBlobUrl = useCallback((tempId) => {
    if (blobUrlsRef.current.has(tempId)) {
      URL.revokeObjectURL(blobUrlsRef.current.get(tempId))
      blobUrlsRef.current.delete(tempId)
    }
  }, [])

  const { online, typing, sendMessage, emitTypingStart, emitTypingStop, emitMessagesRead } =
    useConversation(conversationId, {
      onMessageConfirmed: (tempId) => {
        setPending(prev => prev.filter(m => m.tempId !== tempId))
        revokeBlobUrl(tempId)
        setSending(false)
      },
    })

  const { data: convData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn:  () => getConversation(conversationId),
    enabled:  !!conversationId,
  })

  const {
    data: msgData,
    isLoading: loadingMsgs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn:  ({ pageParam }) => getMessages(conversationId, pageParam ? { cursor: pageParam } : undefined),
    initialPageParam: null,
    getNextPageParam: (last) => (last?.meta?.has_more ? last.meta.next_cursor : undefined),
    enabled:  !!conversationId,
    staleTime: 0,
  })

  const conv = convData?.data
  // pages[0] = newest 50 (desc), pages[1] = older 50, … — flatten then reverse → chronological
  const messages = (msgData?.pages ?? []).flatMap(p => p.data ?? []).reverse()

  // Mark as read when opened + reset scroll state for the new conversation
  useEffect(() => {
    if (conversationId) {
      isFirstScroll.current = true
      markConversationRead(conversationId).catch(() => {})
      emitMessagesRead()
    }
  }, [conversationId])

  /* ── Load older messages when the user scrolls near the top ── */
  const prevScrollHeightRef = useRef(null)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || !hasNextPage || isFetchingNextPage || prevScrollHeightRef.current != null) return
    if (el.scrollTop < 60) {
      prevScrollHeightRef.current = el.scrollHeight
      fetchNextPage()
    }
  }

  // After older messages are prepended, keep the viewport anchored on the same message
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && prevScrollHeightRef.current != null && !isFetchingNextPage) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current
      prevScrollHeightRef.current = null
    }
  }, [isFetchingNextPage])

  // Scroll behavior
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (isFirstScroll.current) {
      if (messages.length === 0 && pendingMsgs.length === 0) return  // wait for content
      el.scrollTop = el.scrollHeight
      isFirstScroll.current = false
    } else if (prevScrollHeightRef.current == null) {
      // Skip auto-scroll while older messages are being prepended at the top
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distFromBottom < 150) el.scrollTop = el.scrollHeight
    }
  }, [messages.length, pendingMsgs.length, typing])

  /* ── File selection (picker, paste) ─────────────────────────────────── */
  const acceptFile = (file) => {
    const type    = detectType(file.type)
    const maxSize = MAX_BYTES[type]

    if (file.size > maxSize) {
      const label = type === 'image' ? 'Images' : type === 'video' ? 'Videos' : 'Documents'
      alert(`${label} must be under ${MAX_LABEL[type]}.\n\nSelected file: ${formatFileSize(file.size)}`)
      return
    }

    if (filePreview?.blobUrl) URL.revokeObjectURL(filePreview.blobUrl)
    const blobUrl = URL.createObjectURL(file)
    setFilePreview({ file, blobUrl, type, name: file.name, size: file.size })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) acceptFile(file)
    e.target.value = ''
  }

  const handlePaste = (e) => {
    const file = e.clipboardData?.files?.[0]
    if (!file) return   // plain text paste — let the browser handle it
    e.preventDefault()
    acceptFile(file)
  }

  /* ── Emoji insert at cursor position ────────────────────────────────── */
  const insertEmoji = (emoji) => {
    const el = inputRef.current
    if (!el) { setInput(v => v + emoji); return }
    const start = el.selectionStart ?? input.length
    const end   = el.selectionEnd ?? input.length
    setInput(input.slice(0, start) + emoji + input.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  /* ── Typing debounce ────────────────────────────────────────────────── */
  const typingTimeout = useRef(null)
  const handleInputChange = (e) => {
    setInput(e.target.value)
    emitTypingStart()
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(emitTypingStop, 1500)
  }

  /* ── Send ────────────────────────────────────────────────────────────── */
  const handleSend = useCallback(async () => {
    if (sending) return

    /* — File message — */
    if (filePreview) {
      const { file, blobUrl, type, name, size } = filePreview
      const tempId = `temp_${Date.now()}`

      // Optimistic message with blob URL for instant preview
      blobUrlsRef.current.set(tempId, blobUrl)
      setPending(prev => [...prev, {
        tempId, body: null, type,
        file_path: blobUrl,    // blob URL shown until server confirms
        file_name: name,
        file_size: size,
        sender_id: user.id,
        created_at: new Date().toISOString(),
      }])
      setFilePreview(null)   // clear preview bar (blobUrl now tracked in blobUrlsRef)
      setSending(true)

      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      })

      try {
        const result = await uploadChatFile(conversationId, file)
        // Upload done — send via socket so chat server persists + broadcasts
        sendMessage(null, tempId, {
          type:      result.type,
          file_path: result.file_path,
          file_name: result.file_name,
          file_size: result.file_size,
        })
        // Fallback: remove optimistic if socket never confirms
        setTimeout(() => {
          setPending(prev => prev.filter(m => m.tempId !== tempId))
          revokeBlobUrl(tempId)
          setSending(false)
        }, 15_000)
      } catch {
        setPending(prev => prev.filter(m => m.tempId !== tempId))
        revokeBlobUrl(tempId)
        setSending(false)
        alert('Upload failed. Could not upload the file. Please try again.')
      }
      return
    }

    /* — Text message — */
    const body = input.trim()
    if (!body) return

    const tempId = `temp_${Date.now()}`
    setPending(prev => [...prev, { tempId, body, sender_id: user.id, created_at: new Date().toISOString() }])
    setInput('')
    emitTypingStop()
    setSending(true)
    sendMessage(body, tempId)

    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })

    setTimeout(() => {
      setPending(prev => prev.filter(m => m.tempId !== tempId))
      setSending(false)
    }, 6_000)
  }, [input, sending, filePreview, user?.id, sendMessage, conversationId, revokeBlobUrl])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isClient     = user?.role === 'client'
  const otherUser    = conv ? (isClient ? conv.freelancer : conv.client) : null
  const otherColors  = getAvatarColor(otherUser?.name ?? '')
  const listPath     = isClient ? '/client/chat' : '/freelancer/chat'
  const contractPath = isClient
    ? `/client/contracts/${conv?.contract_id}`
    : `/freelancer/contracts/${conv?.contract_id}`

  const canSend = !sending && (input.trim().length > 0 || !!filePreview)

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <Link to={listPath} className="md:hidden text-slate-400 hover:text-slate-600 text-sm shrink-0">←</Link>
        <Link to={contractPath} className="hidden md:block text-slate-400 hover:text-slate-600 text-sm shrink-0">←</Link>

        {otherUser && (
          <>
            <div className="relative shrink-0">
              <div className={cn(
                'h-9 w-9 rounded-full text-sm font-semibold flex items-center justify-center',
                otherColors.bg, otherColors.text
              )}>
                {getInitials(otherUser.name)}
              </div>
              {online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{otherUser.name}</p>
              <p className="text-xs text-slate-400">
                {typing ? (
                  <span className="text-green-600 animate-pulse">typing…</span>
                ) : online ? (
                  <span className="text-green-600">Online</span>
                ) : 'Offline'}
              </p>
            </div>
          </>
        )}

        <div className="ml-auto text-xs text-slate-400 truncate max-w-[200px]">
          {conv?.contract?.project?.title}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Loading messages…</p>
          </div>
        ) : messages.length === 0 && pendingMsgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-3xl">💬</p>
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {isFetchingNextPage && (
              <div className="flex justify-center py-1">
                <span className="text-xs text-slate-400 bg-gray-200 rounded-full px-3 py-0.5">
                  Loading older messages…
                </span>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === user?.id}
                showTime={shouldShowTime(messages, i)}
              />
            ))}
            {pendingMsgs.map(msg => (
              <MessageBubble key={msg.tempId} message={msg} isOwn sending />
            ))}
            {typing && <TypingBubble />}
          </div>
        )}
      </div>

      {/* ── File preview bar ── */}
      {filePreview && (
        <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center gap-3">
          {filePreview.type === 'image' && (
            <img src={filePreview.blobUrl} alt={filePreview.name}
              className="h-14 w-14 rounded-lg object-cover shrink-0 border border-slate-200" />
          )}
          {filePreview.type === 'video' && (
            <div className="h-14 w-14 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
              <VideoIcon className="w-6 h-6 text-slate-500" />
            </div>
          )}
          {filePreview.type === 'file' && (
            <div className="h-14 w-14 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
              <FileIcon className="w-6 h-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{filePreview.name}</p>
            <p className="text-xs text-slate-400">{formatFileSize(filePreview.size)}</p>
          </div>
          <button
            type="button"
            onClick={clearFilePreview}
            className="h-7 w-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Composer ── */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        {/* Hidden file inputs */}
        <input ref={mediaInputRef} type="file" accept={MEDIA_ACCEPT} onChange={handleFileSelect} className="hidden" aria-label="Attach image or video" />
        <input ref={docInputRef} type="file" accept={DOC_ACCEPT} onChange={handleFileSelect} className="hidden" aria-label="Attach document" />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-shadow">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={filePreview ? 'Add a caption… (optional)' : 'Type your message… (Ctrl+V to paste image or file)'}
            rows={2}
            className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none max-h-40 overflow-y-auto rounded-t-2xl"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-2 pb-2">
            {/* Attach — dropdown menu */}
            <div className="relative" ref={attachMenuRef}>
              <button
                type="button"
                onClick={() => { setEmojiOpen(false); setAttachOpen(o => !o) }}
                disabled={sending}
                title="Attach a file"
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40',
                  attachOpen ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                )}
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>
              {attachOpen && (
                <div className="absolute bottom-10 left-0 z-20 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5">
                  <button
                    type="button"
                    onClick={() => { setAttachOpen(false); mediaInputRef.current?.click() }}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    Image &amp; Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAttachOpen(false); docInputRef.current?.click() }}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <FileIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    Document
                  </button>
                </div>
              )}
            </div>

            {/* Emoji picker */}
            <div className="relative" ref={emojiMenuRef}>
              <button
                type="button"
                onClick={() => { setAttachOpen(false); setEmojiOpen(o => !o) }}
                disabled={sending}
                title="Insert emoji"
                className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40',
                  emojiOpen ? 'bg-slate-100 text-slate-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                )}
              >
                <SmileIcon className="w-4 h-4" />
              </button>
              {emojiOpen && (
                <div className="absolute bottom-10 left-0 z-20 max-w-[calc(100vw-3rem)] rounded-xl overflow-hidden shadow-lg">
                  <Suspense
                    fallback={
                      <div className="w-[300px] h-[360px] max-w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                        <p className="text-xs text-slate-400">Loading emojis…</p>
                      </div>
                    }
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
                      width={300}
                      height={360}
                      previewConfig={{ showPreview: false }}
                      searchPlaceHolder="Search emoji…"
                      skinTonesDisabled
                      lazyLoadEmojis
                    />
                  </Suspense>
                </div>
              )}
            </div>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="ml-auto h-8 px-4 rounded-lg bg-slate-700 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0"
            >
              {sending ? <SpinnerIcon /> : <SendIcon />}
              Send
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line · Images 6 MB · Videos 20 MB · Docs 25 MB
        </p>
      </div>
    </div>
  )
}

/* ── Message bubble ────────────────────────────────────────────────────────── */
function MessageBubble({ message, isOwn, sending = false, showTime = false }) {
  const type       = message.type || 'text'
  // Use file_url (from server accessor) or fall back to file_path (blob URL for optimistic preview)
  const displayUrl = message.file_url || message.file_path
  const hasText    = message.body && message.body.trim().length > 0

  return (
    <>
      {showTime && (
        <div className="flex justify-center my-1">
          <span className="text-[10px] text-slate-400 bg-gray-200 rounded-full px-3 py-0.5">
            {formatTime(message.created_at)}
          </span>
        </div>
      )}
      <div className={cn('flex items-end gap-1.5', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'max-w-[72%] rounded-2xl shadow-sm overflow-hidden',
          isOwn
            ? 'bg-slate-700 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm',
          sending && 'opacity-60'
        )}>

          {/* Image */}
          {type === 'image' && displayUrl && (
            <button
              type="button"
              onClick={() => window.open(displayUrl, '_blank')}
              className="block w-full"
            >
              <img
                src={displayUrl}
                alt={message.file_name || 'Image'}
                className="max-w-full max-h-64 w-auto object-contain cursor-zoom-in"
              />
            </button>
          )}

          {/* Video */}
          {type === 'video' && displayUrl && (
            <video
              src={displayUrl}
              controls
              className="max-w-full max-h-64 w-auto"
              preload="metadata"
            />
          )}

          {/* File / Document */}
          {type === 'file' && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity',
                !displayUrl && 'pointer-events-none'
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                isOwn ? 'bg-white/15' : 'bg-slate-100'
              )}>
                <FileIcon className={cn('w-4 h-4', isOwn ? 'text-white' : 'text-slate-500')} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-medium truncate max-w-[180px]', isOwn ? 'text-white' : 'text-slate-700')}>
                  {message.file_name || 'File'}
                </p>
                <p className={cn('text-xs mt-0.5', isOwn ? 'text-white/70' : 'text-slate-400')}>
                  {formatFileSize(message.file_size)}
                </p>
              </div>
            </a>
          )}

          {/* Text body (also shown as caption for file messages) */}
          {hasText && (
            <p className={cn(
              'text-sm whitespace-pre-wrap break-words px-4 py-2',
              type !== 'text' && 'pt-1'
            )}>
              {message.body}
            </p>
          )}

          {/* Timestamp row */}
          <div className={cn(
            'flex items-center gap-1 px-4 pb-2',
            isOwn ? 'justify-end' : 'justify-start',
            !hasText && type === 'text' && 'pt-2'
          )}>
            <span className={cn('text-[10px] leading-none', isOwn ? 'text-slate-300' : 'text-slate-400')}>
              {timeAgo(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-[10px] leading-none text-slate-300">
                {sending ? '·' : message.read_at ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── WhatsApp-style typing bubble ── */
function TypingBubble() {
  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #94a3b8;
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <div className="flex justify-start">
        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1.5">
          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
        </div>
      </div>
    </>
  )
}

/* ── Helpers ── */
function shouldShowTime(messages, index) {
  if (index === 0) return true
  const prev = new Date(messages[index - 1].created_at)
  const curr = new Date(messages[index].created_at)
  return curr - prev > 5 * 60 * 1000
}

function formatTime(iso) {
  const d   = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ── Inline SVG icons ── */
function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function PaperclipIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
    </svg>
  )
}

function FileIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function ImageIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function SmileIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
    </svg>
  )
}

function VideoIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )
}

function XIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
