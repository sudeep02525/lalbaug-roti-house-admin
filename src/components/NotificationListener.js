"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playBeep = (freq, startTime, duration) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(1, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // Energetic rapid triple-beep (matched with delivery app)
    playBeep(1200, now, 0.2);
    playBeep(1200, now + 0.15, 0.2);
    playBeep(1500, now + 0.3, 0.4);
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

export default function NotificationListener() {
  const [permission, setPermission] = useState("default");
  const pathname = usePathname();

  useEffect(() => {
    // 1. Request Browser Notification Permission
    if ("Notification" in window) {
      Notification.requestPermission().then((status) => {
        setPermission(status);
      });
    }
  }, []);

  useEffect(() => {
    // Only connect if we are logged in (not on login page)
    if (pathname === "/login") return;
    
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    // 2. Connect to Socket.io backend
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.lalbaugrotihouse.com";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Connected to Real-Time Notifications Server!");
    });

    socket.on("new_order", (data) => {
      console.log("New order received:", data);
      
      // 1. Play Loud Bell Sound
      playNotificationSound();

      // 2. Show Beautiful In-App Toast
      toast((t) => (
        <div className="flex items-center gap-4 min-w-[280px]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-orange-100">
            <span className="text-2xl">🔥</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wide text-white">New Order Received!</span>
            <span className="text-[#FFECC9] font-medium text-sm">Order #{data.orderNumber} • ₹{data.amount}</span>
          </div>
        </div>
      ), { 
        duration: 10000,
        style: {
          background: '#E85D04', // Orange energetic delivery color
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(232,93,4,0.3)',
        }
      });

      // 3. Native OS Notification
      if (Notification.permission === "granted") {
        const notification = new Notification("🔥 New Order Received!", {
          body: `Order ${data.orderNumber} for ₹${data.amount} (${data.type}) has arrived.`,
          icon: "/logo.jpeg"
        });

        // Click to open orders page
        notification.onclick = () => {
          window.focus();
          window.location.href = "/orders";
        };
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [pathname]);

  return null; // Invisible component running in the background
}
