import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId, itemType, itemName, itemLogo } = await request.json()
  const payload: Record<string, any> = {
    user_id: user.id,
    item_id: itemId,
    item_type: itemType,
  }

  if (itemName) payload.item_name = itemName
  if (itemLogo) payload.item_logo = itemLogo

  let { data, error } = await supabase
    .from('favorites')
    .upsert(payload, { onConflict: 'user_id,item_id,item_type' })
    .select()

  if (error) {
    const message = String(error.message || '')
    if (message.includes('item_logo')) {
      delete payload.item_logo
      const retry = await supabase
        .from('favorites')
        .upsert(payload, { onConflict: 'user_id,item_id,item_type' })
        .select()
      data = retry.data
      error = retry.error
    }
    if (error && String(error.message || '').includes('item_name')) {
      delete payload.item_name
      const retry = await supabase
        .from('favorites')
        .upsert(payload, { onConflict: 'user_id,item_id,item_type' })
        .select()
      data = retry.data
      error = retry.error
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId, itemType } = await request.json()
  
  if (!itemId || !itemType) {
    return NextResponse.json({ error: 'Missing itemId or itemType' }, { status: 400 })
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .eq('item_type', itemType)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}


