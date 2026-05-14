"use client";
import { useState, useEffect } from "react";

export default function AlertsPage() {
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [prefs, setPrefs] = useState({ 
    goals: true, 
    cards: true, 
    yellow_cards: false,
    penalties: true,
    var: true,
    kickoff: true 
  });

  useEffect(() => {
    // Check subscription status and fetch prefs on load
    checkSubscriptionStatus();
    // Load preferences from local storage as fallback
    const stored = localStorage.getItem("alert_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrefs(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse stored prefs", e);
      }
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // 1. Local check
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      }

      // 2. Server check & Sync prefs
      const res = await fetch('/api/subscribe');
      if (res.ok) {
        const data = await res.json();
        if (data.subscribed) {
          // Merge with defaults to prevent undefined values causing controlled/uncontrolled warnings
          setPrefs(prev => ({ ...prev, ...data.prefs }));
          localStorage.setItem("alert_preferences", JSON.stringify({ ...prefs, ...data.prefs }));
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
    }
  };

  const savePreferences = async () => {
    setIsSavingPrefs(true);
    setStatusMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      
      if (!subscription) {
        throw new Error("You must enable push notifications before saving preferences.");
      }

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription,
          prefs 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences to server.");
      }

      localStorage.setItem("alert_preferences", JSON.stringify(prefs));
      setStatusMessage({ text: '✓ Preferences saved successfully!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const sanitized = base64String.replace(/\s+/g, '');
    const padding = '='.repeat((4 - sanitized.length % 4) % 4);
    const base64 = (sanitized + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const isEmbeddedBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('electron') || ua.includes('code') || ua.includes('webview');
  };

  const getPushErrorMessage = (err: any) => {
    const message = String(err?.message || '').toLowerCase();

    if (message.includes('push service error')) {
      return 'Push service error: this often happens in embedded browsers or when the browser push service is unavailable. Try a normal browser window and ensure notifications are allowed.';
    }
    if (message.includes('push api in incognito') || message.includes('chrome currently does not support the push api')) {
      return 'Push API is not supported in Chrome incognito mode. Please use a normal browser window.';
    }
    if (message.includes('permission denied')) {
      return 'Push registration failed: permission denied. Please allow notifications in your browser.';
    }
    if (message.includes('not allowed')) {
      return 'Notifications are blocked by the browser. Please allow notifications in your browser settings.';
    }
    if (message.includes('invalid')) {
      return 'Invalid push key or configuration. Ensure your VAPID public key is set correctly.';
    }
    if (err.name === 'AbortError') {
      return 'Registration was cancelled. Please try again.';
    }
    if (err.name === 'NotAllowedError') {
      return 'Permission denied. Check your browser notification settings.';
    }
    return err.message || 'Failed to enable push notifications.';
  };

  const requestPush = async () => {
    if (isEmbeddedBrowser()) {
      setStatusMessage({ text: 'Push notifications are not supported in embedded browsers such as VS Code webview. Please open the app in a normal browser window to enable web push.', type: 'error' });
      return;
    }

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
      const registration = existing ?? (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
      await registration.update();

      // Ensure the service worker is active
      await navigator.serviceWorker.ready;

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!publicVapidKey) {
        setStatusMessage({ 
          text: 'Push notifications are not configured. Please contact support.', 
          type: 'error' 
        });
        return;
      }

      // Add timeout to subscription to prevent hanging
      const subscribeWithTimeout = () => {
        return Promise.race([
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Subscription timed out. This may happen in some browsers like Brave. Try refreshing the page or using a different browser.')), 10000)
          )
        ]);
      };

      const subscription = await subscribeWithTimeout();

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription,
          prefs 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save subscription');
      }

      setStatusMessage({ text: '✓ Push notifications enabled!', type: 'success' });
      setIsSubscribed(true);
      localStorage.setItem("alert_preferences", JSON.stringify(prefs));
    } catch (err: any) {
      console.error('Push error:', err);
      setStatusMessage({ text: getPushErrorMessage(err), type: 'error' });
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Notification Center</h1>
            <p className="text-green-200/70 text-sm">Stay up to date with your favorite teams.</p>
          </div>
          {isSubscribed && (
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
              ACTIVE
            </span>
          )}
        </div>
        
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
              try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                  setStatusMessage({ text: 'Service worker not registered', type: 'error' });
                  return;
                }
                const subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                  setStatusMessage({ text: 'No push subscription found. Please enable notifications first.', type: 'error' });
                  return;
                }
                const res = await fetch('/api/test-notification', { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ subscription })
                });
                const data = await res.json();
                setStatusMessage({ 
                  text: data.success ? '✓ Test notification sent!' : 'Error: ' + (data.error || 'Failed to send'),
                  type: data.success ? 'success' : 'error'
                });
              } catch (err: any) {
                setStatusMessage({ text: 'Error: ' + err.message, type: 'error' });
              }
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            disabled={!isSubscribed}
            className={`w-full sm:w-auto font-bold px-6 py-3 rounded-xl transition border border-gray-700 ${isSubscribed ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
          >
            Send Test Notif
          </button>
        </div>
      </div>

      <div className="space-y-6 bg-gray-900/40 border border-gray-800/60 p-6 rounded-3xl">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-gray-300">Alert Preferences</h2>
          {isSubscribed && (
            <button 
              onClick={savePreferences}
              disabled={isSavingPrefs}
              className="text-xs font-bold text-live-green hover:text-green-400 transition flex items-center gap-1 disabled:opacity-50"
            >
              {isSavingPrefs ? 'Saving...' : 'Save to Cloud'}
            </button>
          )}
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">⚽ Goal Alerts</div>
              <div className="text-xs text-gray-500">Every goal scored</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.goals} 
              onChange={e => setPrefs({...prefs, goals: e.target.checked})} 
              className="toggle toggle-success" 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">🟥 Red Cards</div>
              <div className="text-xs text-gray-500">Game-changing ejections</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.cards} 
              onChange={e => setPrefs({...prefs, cards: e.target.checked})} 
              className="toggle toggle-error" 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">🟨 Yellow Cards</div>
              <div className="text-xs text-gray-500">Player bookings</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.yellow_cards} 
              onChange={e => setPrefs({...prefs, yellow_cards: e.target.checked})} 
              className="toggle toggle-warning" 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">⚠️ Penalties</div>
              <div className="text-xs text-gray-500">Awarded and missed spots</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.penalties} 
              onChange={e => setPrefs({...prefs, penalties: e.target.checked})} 
              className="toggle toggle-info" 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">🖥️ VAR Reviews</div>
              <div className="text-xs text-gray-500">Video review decisions</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.var} 
              onChange={e => setPrefs({...prefs, var: e.target.checked})} 
              className="toggle" 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800">
            <div>
              <div className="font-medium text-gray-200">⏱️ Match Status</div>
              <div className="text-xs text-gray-500">Start, half & full time</div>
            </div>
            <input 
              type="checkbox" 
              checked={prefs.kickoff} 
              onChange={e => setPrefs({...prefs, kickoff: e.target.checked})} 
              className="toggle toggle-info" 
            />
          </div>
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
