"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Bold, Italic, Underline, Strikethrough, Eye, Image as ImageIcon, User, ThumbsUp, Pencil, Trash2, X, Check } from 'lucide-react'
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
}

interface CommentsSectionProps {
  entityId: string
}

export default function CommentsSection({ entityId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'populares' | 'recientes'>('populares')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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

  const handleSubmit = async () => {
    if (!session) {
      alert('Debes iniciar sesión para comentar.')
      return
    }
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entityId, content })
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments((prev) => [...prev, newComment])
        setContent('')
      } else {
        alert('Hubo un error al publicar el comentario.')
      }
    } catch (error) {
      console.error('Error posting comment', error)
    } finally {
      setIsSubmitting(false)
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
        setComments(prev => prev.filter(c => c.id !== commentId))
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

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'populares') {
      return b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

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
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {session?.user?.image ? (
            <img src={session.user.image} alt="User" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* Comment Box */}
        <div className="flex-1 bg-[#1a1b26] rounded-xl overflow-hidden border border-gray-800">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={session ? "Escribe algo..." : "Inicia sesión para comentar..."}
            disabled={!session || isSubmitting}
            className="w-full bg-transparent text-white p-4 min-h-[100px] resize-none focus:outline-none placeholder-gray-500"
          />
          
          {/* Toolbar & Submit */}
          <div className="flex justify-between items-center px-4 py-2 bg-[#1a1b26] border-t border-gray-800/50">
            {/* Formatting Tools */}
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-white transition-colors"><Bold className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Italic className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Underline className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Strikethrough className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
              <button className="hover:text-white transition-colors"><ImageIcon className="w-4 h-4" /></button>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!session || isSubmitting || !content.trim()}
              className="bg-[#2f334d] hover:bg-[#3b405e] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Responder
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="flex-shrink-0">
              {comment.avatar ? (
                <img src={comment.avatar} alt={comment.username} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{comment.username}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                </span>
                {(session?.user as any)?.id === comment.userId && editingCommentId !== comment.id && (
                  <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingCommentId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="text-gray-500 hover:text-white transition-colors"
                      title="Editar comentario"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      title="Eliminar comentario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2 bg-[#1a1b26] rounded-xl overflow-hidden border border-gray-800">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent text-white p-3 min-h-[80px] resize-none focus:outline-none placeholder-gray-500"
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
                  <p className="text-gray-300 mb-2 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="hover:text-white transition-colors">Responder</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Sé el primero en comentar.
          </div>
        )}
      </div>
    </div>
  )
}
