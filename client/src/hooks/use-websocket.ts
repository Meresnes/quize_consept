import { useEffect, useRef, useState } from "react";
import { REPLIT_URL } from "@/lib/constants";

export function useWebSocket() {
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      const data = JSON.parse(event.data);
      if (data.type === "voteCounts") {
        console.log('Vote counts updated:', data.data);
        setVoteCounts(data.data);
      }
    };

    return () => {
      console.log('Cleaning up WebSocket connection');
      wsRef.current?.close();
    };
  }, []);

  return { voteCounts };
}