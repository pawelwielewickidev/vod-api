import { useRef, useState, useEffect } from "react";
import { Play, Pause, Maximize, Volume2 } from "lucide-react";
import Hls from "hls.js";

const PROGRESS_SAVE_INTERVAL_MS = 15000;

export default function CustomPlayer({
  streamUrl,
  title,
  episodeNumber,
  initialTimestampSeconds = 0,
  onProgressSave,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const lastProgressSaveRef = useRef(0);
  const initialSeekAppliedRef = useRef(false);
  const hasPlayedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔥 MAGIA HLS.JS (Obsługa m3u8 w Chrome oraz zwykłych mp4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls;
    initialSeekAppliedRef.current = false;

    const applyInitialSeek = () => {
      if (
        !initialSeekAppliedRef.current &&
        initialTimestampSeconds > 0 &&
        Number.isFinite(video.duration) &&
        initialTimestampSeconds < video.duration
      ) {
        video.currentTime = initialTimestampSeconds;
        initialSeekAppliedRef.current = true;
      }
    };

    video.addEventListener("loadedmetadata", applyInitialSeek);
    video.addEventListener("canplay", applyInitialSeek);

    if (streamUrl.includes(".m3u8") && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("✅ HLS załadowany i gotowy do odtwarzania!");
        applyInitialSeek();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }

    return () => {
      video.removeEventListener("loadedmetadata", applyInitialSeek);
      video.removeEventListener("canplay", applyInitialSeek);

      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, initialTimestampSeconds]);

  const saveCurrentProgress = async ({
    force = false,
    keepalive = false,
  } = {}) => {
    // BLOKADA: Jeśli wideo nigdy nie zostało uruchomione przez użytkownika,
    // NIE WYSYŁAJ 0 do bazy danych! Przerywamy działanie funkcji.
    if (!hasPlayedRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video || typeof onProgressSave !== "function") {
      return;
    }

    const currentTime = video.currentTime;
    const duration = video.duration;

    if (!Number.isFinite(currentTime) || currentTime < 0) {
      return;
    }

    const now = Date.now();

    if (
      !force &&
      now - lastProgressSaveRef.current < PROGRESS_SAVE_INTERVAL_MS
    ) {
      return;
    }

    lastProgressSaveRef.current = now;

    await onProgressSave({
      currentTime,
      duration,
      keepalive,
    });
  };

  const togglePlay = () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Wideo nie mogło wystartować:", error);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) {
      return;
    }

    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;

    setProgress((current / total) * 100 || 0);
    saveCurrentProgress();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      hasPlayedRef.current = true; // AKTYWACJA: Wideo wystartowało, można zapisywać postęp!
      setIsPlaying(true);
    };

    const handlePause = () => {
      saveCurrentProgress({ force: true });
      setIsPlaying(false);
    };

    const handleEnded = () => {
      saveCurrentProgress({ force: true });
      setIsPlaying(false);
      setProgress(100);
    };

    const handlePageHide = () => {
      saveCurrentProgress({ force: true, keepalive: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveCurrentProgress({ force: true, keepalive: true });
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      saveCurrentProgress({ force: true, keepalive: true });
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onProgressSave]);

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();

    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;

    videoRef.current.currentTime = percentage * videoRef.current.duration;
    saveCurrentProgress({ force: true });
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full h-96 bg-black flex items-center justify-center"
      >
        {/* Left black bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[100px] bg-black z-10" />

        {/* Video container */}
        <div className="relative h-full flex-1 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            key={streamUrl}
            className="h-full object-contain cursor-pointer"
            onClick={togglePlay}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Right black bar */}
        <div className="absolute right-0 top-0 bottom-0 w-[100px] bg-black z-10" />
      </div>

      {/* Details and controls below player */}
      <div className="mx-auto w-full max-w-6xl px-8">
        <div className="mb-4"></div>

        {/* Progress bar */}
        <div
          className="w-full py-3 cursor-pointer group/bar relative flex items-center mb-4"
          onClick={handleSeek}
        >
          <div
            className="w-full h-1.5 bg-neutral-600 rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, 
        #ff6400  0%, 
        #ff6400 ${progress}%, 
        white ${progress}%, 
        white 100%)`,
            }}
          ></div>

          <div
            className="absolute w-4 h-4 rounded-full scale-100 group-hover/bar:scale-125 transition-transform shadow-lg z-20 pointer-events-none"
            style={{
              left: `calc(${progress}% - 8px)`,
              backgroundColor: "#ff6400",
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={togglePlay}
              className="hover:text-crunchy transition-colors"
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>
            <button className="hover:text-crunchy transition-colors">
              <Volume2 size={24} />
            </button>
          </div>

          <div className="flex items-center text-white">
            <button
              onClick={toggleFullScreen}
              className="hover:text-crunchy transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
