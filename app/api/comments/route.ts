import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export interface Comment {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 })
    }

    const key = `comments:${entityId}`
    const commentsData = await redis.get(key)
    const comments: Comment[] = commentsData ? JSON.parse(commentsData) : []

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entityId, content, parentId } = await request.json()

    if (!entityId || !content) {
      return NextResponse.json({ error: 'entityId and content are required' }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 })
    }

    const key = `comments:${entityId}`
    const commentsData = await redis.get(key)
    const comments: Comment[] = commentsData ? JSON.parse(commentsData) : []

    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: (session.user as any).id,
      username: session.user.name || 'Anonymous',
      avatar: session.user.image || null,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      parentId: parentId || undefined
    }

    comments.push(newComment)
    await redis.set(key, JSON.stringify(comments))

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Error posting comment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entityId, commentId, content } = await request.json()

    if (!entityId || !commentId || !content) {
      return NextResponse.json({ error: 'entityId, commentId, and content are required' }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 })
    }

    const key = `comments:${entityId}`
    const commentsData = await redis.get(key)
    if (!commentsData) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    let comments: Comment[] = JSON.parse(commentsData)
    const commentIndex = comments.findIndex(c => c.id === commentId)

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comments[commentIndex].userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    comments[commentIndex].content = content
    await redis.set(key, JSON.stringify(comments))

    return NextResponse.json(comments[commentIndex])
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entityId, commentId } = await request.json()

    if (!entityId || !commentId) {
      return NextResponse.json({ error: 'entityId and commentId are required' }, { status: 400 })
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis is not configured' }, { status: 500 })
    }

    const key = `comments:${entityId}`
    const commentsData = await redis.get(key)
    if (!commentsData) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    let comments: Comment[] = JSON.parse(commentsData)
    const commentIndex = comments.findIndex(c => c.id === commentId)

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comments[commentIndex].userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    comments.splice(commentIndex, 1)
    await redis.set(key, JSON.stringify(comments))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
