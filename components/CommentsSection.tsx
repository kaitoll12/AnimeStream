"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { upload } from '@vercel/blob/client'
import { Bold, Italic, Underline, Strikethrough, Eye, Image as ImageIcon, User, ThumbsUp, Pencil, Trash2, X, Check, Loader2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Comment {
  id: string
  userId: string
  username: string
  avatar: string | null
  content: string
  createdAt: string
  likes: number
  likedBy?: string[]
  parentId?: string
}

interface CommentsSectionProps {
  entityId: string
}

export default function CommentsSection({ entityId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const currentUserId = (session?.user as any)?.id

  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'populares' | 'recientes'>('populares')
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [entityId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?entityId=${entityId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to fetch comments', error)
    }
  }

  const handleSubmit = async (parentId?: string) => {
    if (!session) {
      alert('Debes iniciar sesión para comentar.')
      return
    }
    
    const textContent = parentId ? replyContent : content
    if (!textContent.trim() && !attachedImage) return

    if (parentId) setIsSubmittingReply(true)
    else setIsSubmitting(true)

    try {
      const finalContent = attachedImage && !parentId ? `${textContent}\n[img]${attachedImage}[/img]` : textContent

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, content: finalContent, parentId })
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        
        if (parentId) {
          setReplyContent('')
          setReplyingToId(null)
        } else {
          setContent('')
          setAttachedImage(null)
        }
      } else {
        alert('Hubo un error al publicar el comentario.')
      }
    } catch (error) {
      console.error('Error posting comment', error)
    } finally {
      if (parentId) setIsSubmittingReply(false)
      else setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session) {
      alert('Debes iniciar sesión para dar like.')
      return
    }

    // Optimistic UI update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const likedBy = c.likedBy || []
        const hasLiked = likedBy.includes(currentUserId)
        return {
          ...c,
          likes: hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
          likedBy: hasLiked ? likedBy.filter(id => id !== currentUserId) : [...likedBy, currentUserId]
        }
      }
      return c
    }))

    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, commentId })
      })

      if (!res.ok) {
        // Revert on failure
        fetchComments()
      }
    } catch (error) {
      console.error('Error toggling like', error)
      fetchComments()
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, commentId })
      })

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId))
      } else {
        alert('Error al eliminar el comentario.')
      }
    } catch (error) {
      console.error('Error deleting comment', error)
    }
  }

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, commentId, content: editContent })
      })

      if (res.ok) {
        const updatedComment = await res.json()
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c))
        setEditingCommentId(null)
      } else {
        alert('Error al editar el comentario.')
      }
    } catch (error) {
      console.error('Error editing comment', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const newBlob = await upload(uniqueFilename, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })
      setAttachedImage(newBlob.url)
    } catch (error) {
      alert("Error al subir la imagen")
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const renderContent = (text: string) => {
    const parts = text.split(/(\[img\].*?\[\/img\])/)
    return parts.map((part, i) => {
      if (part.startsWith('[img]') && part.endsWith('[/img]')) {
        const url = part.slice(5, -6)
        return <img key={i} src={url} alt="Comentario" className="max-w-full max-h-96 rounded-lg my-2 object-contain bg-black/20" />
      }
      return <span key={i}>{part}</span>
    })
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'populares') {
      return b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const mainComments = sortedComments.filter(c => !c.parentId)
  const getReplies = (parentId: string) => sortedComments.filter(c => c.parentId === parentId)

  const CommentNode = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => {
    const isEditing = editingCommentId === comment.id
    const hasLiked = comment.likedBy?.includes(currentUserId)

    return (
      <div className={`flex gap-4 ${isReply ? 'mt-4' : ''}`}>
        <div className="flex-shrink-0">
          {comment.avatar ? (
            <img src={comment.avatar} alt={comment.username} className={`rounded-full ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`} />
          ) : (
            <div className={`rounded-full bg-gray-600 flex items-center justify-center ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <User className={`${isReply ? 'w-4 h-4' : 'w-6 h-6'} text-gray-300`} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${isReply ? 'text-sm' : ''}`}>{comment.username}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
            </span>
            {currentUserId === comment.userId && !isEditing && (
              <div className="ml-auto flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditingCommentId(comment.id)
                    setEditContent(comment.content)
                  }}
                  className="text-gray-500 hover:text-white transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-2 bg-[#1a1b26] rounded-xl overflow-hidden border border-gray-800">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent text-white p-3 min-h-[80px] resize-none focus:outline-none placeholder-gray-500 text-sm"
              />
              <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-800/50 bg-[#1a1b26]">
                <button
                  onClick={() => setEditingCommentId(null)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  onClick={() => handleEditSubmit(comment.id)}
                  className="flex items-center gap-1 text-xs bg-[#2f334d] hover:bg-[#3b405e] text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={`text-gray-300 mb-2 whitespace-pre-wrap break-words ${isReply ? 'text-sm' : ''}`}>
                {renderContent(comment.content)}
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-blue-500' : 'hover:text-white'}`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
                  <span>{comment.likes || 0}</span>
                </button>
                {!isReply && (
                  <button 
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Responder</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{comments.length} Comentarios</h2>
        <div className="flex items-center text-sm text-gray-400">
          <span className="mr-2">Ordenar por:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'populares' | 'recientes')}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option className="bg-[#1a1b26] text-white" value="populares">Populares</option>
            <option className="bg-[#1a1b26] text-white" value="recientes">Recientes</option>
          </select>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex gap-4 mb-8">
        <div className="flex-shrink-0">
          {session?.user?.image ? (
            <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex-1 bg-[#1a1b26] rounded-xl overflow-hidden border border-gray-800 focus-within:border-gray-600 transition-colors">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={session ? "Agrega un comentario..." : "Inicia sesión para comentar..."}
            disabled={!session || isSubmitting}
            className="w-full bg-transparent text-white p-4 min-h-[100px] resize-none focus:outline-none placeholder-gray-500"
          />

          {attachedImage && (
            <div className="relative inline-block mx-4 mb-4">
              <img src={attachedImage} alt="Preview" className="h-32 rounded-lg object-contain bg-black/20" />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                title="Quitar imagen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center px-4 py-2 bg-[#1a1b26] border-t border-gray-800/50">
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-white transition-colors"><Bold className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Italic className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Underline className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Strikethrough className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || !session}
                className="hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Añadir imagen"
              >
                {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              </button>
            </div>
            
            <button
              onClick={() => handleSubmit()}
              disabled={!session || isSubmitting || (!content.trim() && !attachedImage)}
              className="bg-[#2f334d] hover:bg-[#3b405e] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comentar
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {mainComments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentNode comment={comment} />
            
            {/* Replies */}
            {getReplies(comment.id).length > 0 && (
              <div className="ml-14 space-y-4 border-l-2 border-gray-800 pl-4">
                {getReplies(comment.id).map(reply => (
                  <CommentNode key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}

            {/* Reply Input Box */}
            {replyingToId === comment.id && (
              <div className="ml-14 flex gap-4 mt-2">
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-[#1a1b26] rounded-xl overflow-hidden border border-gray-800 focus-within:border-gray-600 transition-colors">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    disabled={isSubmittingReply}
                    className="w-full bg-transparent text-white p-3 min-h-[60px] resize-none focus:outline-none placeholder-gray-500 text-sm"
                  />
                  <div className="flex justify-end gap-2 px-3 py-2 border-t border-gray-800/50 bg-[#1a1b26]">
                    <button
                      onClick={() => setReplyingToId(null)}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSubmit(comment.id)}
                      disabled={isSubmittingReply || !replyContent.trim()}
                      className="bg-[#2f334d] hover:bg-[#3b405e] text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-[#1a1b26] rounded-xl border border-gray-800/50">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Sé el primero en comentar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
