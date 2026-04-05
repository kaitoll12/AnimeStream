import { del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No se proporcionó URL' }, { status: 400 })
    }

    // Delete from Vercel Blob (Cloud)
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar:', error)
    return NextResponse.json({ error: 'Error al eliminar el archivo' }, { status: 500 })
  }
}
