import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { revalidatePath } from 'next/cache'

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

  // Fetch favorites
  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)

  const leagues = favorites?.filter(f => f.type === 'league') || []
  const teams = favorites?.filter(f => f.type === 'team') || []

  // Add a server action to remove favorites inline
  async function removeFavorite(formData: FormData) {
    'use server'
    const id = formData.get('id')
    const supabase = await createClient()
    await supabase.from('favorites').delete().eq('id', id)
    revalidatePath('/profile')
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
            🏆 Favorite Competitions
          </h2>
          {leagues.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No favorite competitions yet.</p>
          ) : (
            <ul className="space-y-3">
              {leagues.map((league) => (
                <li key={league.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3">
                    {league.item_logo && <Image src={league.item_logo} alt={league.item_name} width={32} height={32} className="w-8 h-8 object-contain" />}
                    <span className="font-medium text-gray-200">{league.item_name}</span>
                  </div>
                  <form action={removeFavorite}>
                    <input type="hidden" name="id" value={league.id} />
                    <button type="submit" className="text-red-400 hover:text-red-300 text-sm p-2 bg-red-400/10 rounded-lg transition-colors">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
            ⚽ Favorite Teams
          </h2>
          {teams.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No favorite teams yet.</p>
          ) : (
            <ul className="space-y-3">
              {teams.map((team) => (
                <li key={team.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-3">
                    {team.item_logo && <Image src={team.item_logo} alt={team.item_name} width={32} height={32} className="w-8 h-8 object-contain" />}
                    <span className="font-medium text-gray-200">{team.item_name}</span>
                  </div>
                  <form action={removeFavorite}>
                    <input type="hidden" name="id" value={team.id} />
                    <button type="submit" className="text-red-400 hover:text-red-300 text-sm p-2 bg-red-400/10 rounded-lg transition-colors">
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="text-center text-sm text-gray-500">
        To add favorites, browse the home page or match pages and click the star icons.
      </div>
    </div>
  )
}
