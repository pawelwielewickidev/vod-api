import { useRef, useState } from "react";
import { Play, Pause, Maximize, Volume2 } from "lucide-react";

export default function CustomPlayer({ streamUrl, title, episodeNumber }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      try {
      videoRef.current.play();
      setIsPlaying(true);
      } catch (error) {
        console.error("Video failed to play:", error);
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    setProgress((current / total) * 100);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !videoRef.current.duration) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();

    const clickPosition = e.clientX - rect.left;

    const percentage = clickPosition / rect.width;

    videoRef.current.currentTime = percentage * videoRef.current.duration;
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
            src={streamUrl}
            className="h-full object-contain cursor-pointer"
            onClick={togglePlay}
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
            className="absolute w-4 h-4 bg-#ff6400  rounded-full scale-100 group-hover/bar:scale-125 transition-transform shadow-lg z-20 pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
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
