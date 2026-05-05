"use client";
import { useState, useEffect } from "react";

export default function AlertsPage() {
  const [followed, setFollowed] = useState<any[]>([]);
  const [prefs, setPrefs] = useState({ goals: true, cards: true, kickoff: true });

  useEffect(() => {
    // Load preferences
    const stored = localStorage.getItem("followed_teams");
    if (stored) setFollowed(JSON.parse(stored));
  }, []);

  const requestPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        alert('Push notifications enabled!');
      } catch (err) {
        console.error('Push error', err);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-800/50 rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Center</h1>
        <p className="text-green-200/70 text-sm mb-6">Stay up to date with your favorite teams.</p>
        
        <button onClick={requestPush} className="w-full sm:w-auto bg-live-green text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition shadow-lg shadow-green-900/50">
          Enable Web Push Alerts
        </button>
      </div>

      <div className="space-y-4 bg-gray-900/40 border border-gray-800/60 p-6 rounded-3xl">
        <h2 className="font-bold text-gray-300">Alert Preferences</h2>
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div><div className="font-medium">Goal Alerts</div><div className="text-xs text-gray-500">Every time the net bulges</div></div>
          <input type="checkbox" checked={prefs.goals} onChange={e => setPrefs({...prefs, goals: e.target.checked})} className="toggle toggle-success" />
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div><div className="font-medium">Red Cards</div><div className="text-xs text-gray-500">Crucial sending offs</div></div>
          <input type="checkbox" checked={prefs.cards} onChange={e => setPrefs({...prefs, cards: e.target.checked})} className="toggle toggle-error" />
        </div>
      </div>

      <div className="bg-[#24A1DE]/10 border border-[#24A1DE]/30 p-6 rounded-3xl">
        <h2 className="font-bold text-white mb-2 flex items-center gap-2">
          <span>✈️</span> Telegram Bot
        </h2>
        <p className="text-sm text-gray-400 mb-6">Prefer Telegram? Link your account to our official bot for instant updates.</p>
        <a href="https://t.me/ChhalDaroBot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#24A1DE] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#1d8ec7] transition">
          Open Telegram
        </a>
      </div>
    </div>
  );
}
