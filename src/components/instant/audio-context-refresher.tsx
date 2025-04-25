import { useRef, useState, useEffect } from "react";

export function AudioContextRefresher() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasUserBeenActive, setHasUserBeenActive] = useState(false);

  useEffect(() => {
    function markActive() {
      setHasUserBeenActive((prev) => prev || true);
    }

    if (!hasUserBeenActive) {
      document.addEventListener("click", markActive);
      document.addEventListener("keydown", markActive);
      document.addEventListener("touchstart", markActive);
    }

    return () => {
      document.removeEventListener("click", markActive);
      document.removeEventListener("keydown", markActive);
      document.removeEventListener("touchstart", markActive);
    };
  }, [hasUserBeenActive]);

  // Try to play audio when hasUserBeenActive becomes true
  useEffect(() => {
    if (hasUserBeenActive && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
      });
    }
  }, [hasUserBeenActive]);

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      audioRef.current.play().catch((e) => {
        console.log("Audio play error:", e);
      });
    }
  };

  return (
    <audio
      ref={audioRef}
      src="/assets/silence-10-seconds.mp3"
      style={{ opacity: 0, position: "absolute", top: -1000 }}
      onEnded={handleEnded}
      controls={true}
      preload="auto"
    />
  );
}
