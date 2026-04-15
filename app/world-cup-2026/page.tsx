export default function WorldCup() {
  // Static mock since 2026 hasn't happened. In reality you'd SWR fetch the groups.
  const groups = Array.from({ length: 12 }).map((_, i) => String.fromCharCode(65 + i));

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center space-y-3 py-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 rounded-3xl border border-blue-800/50">
        <span className="text-5xl">🏆</span>
        <h1 className="text-3xl font-black text-white tracking-tighter">World Cup 2026</h1>
        <p className="text-blue-300 font-medium">Coming June 11, 2026 — North America</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
          <span className="text-live-green block w-2 h-6 rounded-sm bg-live-green"></span>
          Group Stage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map(group => (
            <div key={group} className="bg-gray-900 border border-gray-800 rounded-xl p-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition duration-500">
              <h3 className="font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">Group {group}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between text-gray-500"><span>TBD 1</span> <span>0</span></li>
                <li className="flex justify-between text-gray-500"><span>TBD 2</span> <span>0</span></li>
                <li className="flex justify-between text-gray-500"><span>TBD 3</span> <span>0</span></li>
                <li className="flex justify-between text-gray-500"><span>TBD 4</span> <span>0</span></li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="opacity-50">
        <h2 className="text-xl font-bold text-gray-200 mb-6 mt-12 flex items-center gap-2">
          <span className="text-gray-500 block w-2 h-6 rounded-sm bg-gray-500"></span>
          Knockout Bracket
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center border-dashed">
          <div className="text-gray-500 italic">Knockout bracket will render here once Round of 32 begins</div>
        </div>
      </section>
    </div>
  );
}
