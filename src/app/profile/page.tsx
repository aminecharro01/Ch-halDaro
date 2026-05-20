import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Trophy, Users, Calendar, Trash2 } from 'lucide-react'
import { enrichFavorites } from '@/lib/favorites-enrich'

export default async function ProfilePage() {
  const supabase = await createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Supabase Not Configured</h2>
        <p className="text-gray-400">Please configure Supabase environment variables to use the Profile feature.</p>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: favoritesRaw } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)

  const favorites = await enrichFavorites(favoritesRaw || [])

  const leagues = favorites.filter((f) => f.item_type === 'league')
  const teams = favorites.filter((f) => f.item_type === 'team')
  const matches = favorites.filter((f) => f.item_type === 'match')

  async function removeFavorite(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const supabase = await createClient()
    await supabase.from('favorites').delete().eq('id', id)
    revalidatePath('/profile')
  }

  function favoriteHref(item: { item_type: string; item_id: string }) {
    if (item.item_type === 'team') return `/team/${item.item_id}`
    if (item.item_type === 'league') return `/league/${item.item_id}`
    if (item.item_type === 'match') return `/match/${item.item_id}`
    return '#'
  }

  function displayName(item: { item_name?: string | null; item_type: string; item_id: string }) {
    if (item.item_name?.trim()) return item.item_name
    return `${item.item_type} #${item.item_id}`
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Your Profile</h1>
        <p className="text-gray-400">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Favorite Competitions
          </h2>
          {leagues.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No favorite competitions yet.</p>
          ) : (
            <ul className="space-y-3">
              {leagues.map((league) => (
                <li key={league.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                  <Link href={favoriteHref(league)} className="flex items-center gap-3 min-w-0 flex-1 hover:text-green-400 transition">
                    {league.item_logo && (
                      <Image src={league.item_logo} alt="" width={32} height={32} className="w-8 h-8 object-contain shrink-0" />
                    )}
                    <span className="font-medium text-gray-200 truncate">{displayName(league)}</span>
                  </Link>
                  <form action={removeFavorite}>
                    <input type="hidden" name="id" value={league.id} />
                    <button type="submit" className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition-colors" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" /> Favorite Teams
          </h2>
          {teams.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No favorite teams yet.</p>
          ) : (
            <ul className="space-y-3">
              {teams.map((team) => (
                <li key={team.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                  <Link href={favoriteHref(team)} className="flex items-center gap-3 min-w-0 flex-1 hover:text-green-400 transition">
                    {team.item_logo && (
                      <Image src={team.item_logo} alt="" width={32} height={32} className="w-8 h-8 object-contain shrink-0" />
                    )}
                    <span className="font-medium text-gray-200 truncate">{displayName(team)}</span>
                  </Link>
                  <form action={removeFavorite}>
                    <input type="hidden" name="id" value={team.id} />
                    <button type="submit" className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition-colors" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Favorite Matches
          </h2>
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                <Link href={favoriteHref(match)} className="font-medium text-gray-200 hover:text-green-400 truncate flex-1">
                  {displayName(match)}
                </Link>
                <form action={removeFavorite}>
                  <input type="hidden" name="id" value={match.id} />
                  <button type="submit" className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 rounded-lg transition-colors" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        To add favorites, browse the home page or match pages and click the heart icon.
      </div>
    </div>
  )
}
