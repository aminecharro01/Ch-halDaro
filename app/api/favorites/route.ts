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
  const { data, error } = await supabase
    .from('favorites')
    .upsert({ 
      user_id: user.id, 
      item_id: itemId, 
      item_type: itemType,
      item_name: itemName,
      item_logo: itemLogo
    })
    .select()

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


