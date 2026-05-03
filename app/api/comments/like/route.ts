import { NextResponse } from 'next/server'
import Redis from 'ioredis'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { Comment } from '../route'

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || ''
const redis = redisUrl ? new Redis(redisUrl) : null

export async function POST(request: Request) {
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

    const userId = (session.user as any).id
    const comment = comments[commentIndex]

    if (!comment.likedBy) {
      comment.likedBy = []
    }

    const hasLiked = comment.likedBy.includes(userId)

    if (hasLiked) {
      comment.likedBy = comment.likedBy.filter(id => id !== userId)
      comment.likes = Math.max(0, comment.likes - 1)
    } else {
      comment.likedBy.push(userId)
      comment.likes += 1
    }

    await redis.set(key, JSON.stringify(comments))

    return NextResponse.json({ 
      success: true, 
      likes: comment.likes, 
      likedBy: comment.likedBy,
      hasLiked: !hasLiked 
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
