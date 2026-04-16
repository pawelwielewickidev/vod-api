import { useRef, useState } from "react";
import { Play, Pause, Maximize, Volume2 } from "lucide-react";

export default function CustomPlayer({ streamUrl, title, episodeNumber }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
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
    <div
      ref={containerRef}
      className="relative group w-full max-w-4xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex items-center justify-center aspect-video"
    >
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
        <div className="text-white font-semibold text-sm mb-1 px-2 drop-shadow-md">
          <span className="text-crunchy">Odcinek {episodeNumber}</span> |{" "}
          {title}
        </div>

        {/* Progress bar */}
        <div
          className="w-full py-3 cursor-pointer group/bar relative flex items-center"
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
            className="absolute w-4 h-4 bg-#ff6400  rounded-full scale-0 group-hover/bar:scale-100 transition-transform shadow-lg z-20 pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
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

      {!isPlaying && progress === 0 && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-20 h-20 bg-crunchy/90 hover:bg-crunchy text-white rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-[0_0_30px_rgba(255,100,0,0.5)]"
        >
          <Play size={40} fill="currentColor" className="ml-1" />
        </button>
      )}
    </div>
  );
}
