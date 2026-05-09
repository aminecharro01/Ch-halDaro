import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple in-memory storage for demo mode
let MOCK_FAVORITES = [
  { item_id: "541", item_type: "team" },
  { item_id: "50", item_type: "team" },
  { item_id: "529", item_type: "team" },
  { item_id: "39", item_type: "league" },
  { item_id: "140", item_type: "league" },
  { item_id: "2", item_type: "league" },
  { item_id: "1", item_type: "league" }
];

export async function GET() {
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.json(MOCK_FAVORITES);
  }

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
  if (process.env.DEMO_MODE === "true") {
    const { itemId, itemType } = await request.json();
    if (!MOCK_FAVORITES.find(f => f.item_id === String(itemId) && f.item_type === itemType)) {
      MOCK_FAVORITES.push({ item_id: String(itemId), item_type: itemType });
    }
    return NextResponse.json({ success: true });
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId, itemType } = await request.json()

  const { data, error } = await supabase
    .from('favorites')
    .upsert({ user_id: user.id, item_id: itemId, item_type: itemType })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  if (process.env.DEMO_MODE === "true") {
    const { itemId, itemType } = await request.json();
    MOCK_FAVORITES = MOCK_FAVORITES.filter(f => !(f.item_id === String(itemId) && f.item_type === itemType));
    return NextResponse.json({ success: true });
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId, itemType } = await request.json()

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
