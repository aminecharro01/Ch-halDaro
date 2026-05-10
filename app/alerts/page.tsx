"use client";
import { useState, useEffect } from "react";

export default function AlertsPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [prefs, setPrefs] = useState({ goals: true, cards: true, kickoff: true });

  useEffect(() => {
    // Check subscription status on load
    checkSubscriptionStatus();
    // Load preferences
    const stored = localStorage.getItem("followed_teams");
    if (stored) setPrefs(JSON.parse(stored));
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatusMessage({ text: 'Push notifications are not supported in this browser.', type: 'error' });
      return;
    }

    setIsRegistering(true);
    setStatusMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatusMessage({ text: 'Permission not granted. Please check your browser settings.', type: 'error' });
        return;
      }

      // Get existing registration or register a new one
      const existing = await navigator.serviceWorker.getRegistration();
      const registration = existing ?? (await navigator.serviceWorker.register('/sw.js'));

      // Ensure the service worker is active
      await navigator.serviceWorker.ready;

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        setStatusMessage({ 
          text: 'Push notifications are not configured. Please contact support.', 
          type: 'error' 
        });
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save subscription');
      }

      setStatusMessage({ text: '✓ Push notifications enabled!', type: 'success' });
      setIsSubscribed(true);
    } catch (err: any) {
      console.error('Push error:', err);
      let errorMsg = 'Failed to enable push notifications.';
      
      if (err.name === 'AbortError') {
        errorMsg = 'Registration was cancelled. Please try again.';
      } else if (err.name === 'NotAllowedError') {
        errorMsg = 'Permission denied. Check your browser notification settings.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setStatusMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsRegistering(false);
    }
  };

  const disablePush = async () => {
    setIsUnsubscribing(true);
    setStatusMessage(null);

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            const response = await fetch('/api/subscribe', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: subscription.endpoint }),
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to unsubscribe');
            }

            await subscription.unsubscribe();
            setStatusMessage({ text: '✓ Push notifications disabled!', type: 'success' });
            setIsSubscribed(false);
          }
        }
      }
    } catch (err: any) {
      console.error('Unsubscribe error:', err);
      setStatusMessage({ text: err.message || 'Failed to disable push notifications', type: 'error' });
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {statusMessage && (
        <div className={`p-4 rounded-lg border ${
          statusMessage.type === 'success' 
            ? 'bg-green-900/30 border-green-700 text-green-300' 
            : statusMessage.type === 'error'
            ? 'bg-red-900/30 border-red-700 text-red-300'
            : 'bg-blue-900/30 border-blue-700 text-blue-300'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-800/50 rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Center</h1>
        <p className="text-green-200/70 text-sm mb-6">Stay up to date with your favorite teams.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {!isSubscribed ? (
            <button 
              onClick={requestPush} 
              disabled={isRegistering}
              className="w-full sm:w-auto bg-live-green text-gray-950 font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition shadow-lg shadow-green-900/50 disabled:opacity-50 disabled:cursor-wait"
            >
              {isRegistering ? 'Enabling...' : 'Enable Web Push Alerts'}
            </button>
          ) : (
            <button 
              onClick={disablePush} 
              disabled={isUnsubscribing}
              className="w-full sm:w-auto bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-900/50 disabled:opacity-50 disabled:cursor-wait"
            >
              {isUnsubscribing ? 'Disabling...' : 'Disable Push Alerts'}
            </button>
          )}
          <button 
            onClick={async () => {
              const res = await fetch('/api/test-notification', { method: 'POST' });
              const data = await res.json();
              setStatusMessage({ 
                text: data.success ? '✓ Test notification sent!' : 'Error: ' + (data.error || 'Failed to send'),
                type: data.success ? 'success' : 'error'
              });
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="w-full sm:w-auto bg-gray-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-700 transition border border-gray-700"
          >
            Send Test Notif
          </button>
        </div>
        {isSubscribed && (
          <p className="text-green-200/70 text-sm mt-4">✓ Push notifications are currently enabled</p>
        )}
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
