import {
  faCompress,
  faExpand,
  faPause,
  faPlay,
  faStop,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  thumbnail: string;
}

function VideoPlayer({ src, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<number | null>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState();
  const [muted, setMuted] = useState();
  const [isNativeControls, setIsNativeControls] = useState(
    window.innerWidth < 767
  );

  useEffect(() => {
    const handleResize = () => {
      setIsNativeControls(window.innerWidth < 767);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const updateProgress = () => {
    if (videoRef.current) {
      const value =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(value);
    }
  };

  const startProgressLoop = () => {
    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Set up an interval for updating the progress bar
    intervalRef.current = setInterval(() => {
      updateProgress();
    }, 1000); // Update every second
  };

  const stopProgressLoop = () => {
    // Clear the interval when the video is paused or stopped
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        startProgressLoop();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        stopProgressLoop();
      }
    }
  };

  useEffect(() => {
    // Set up an event Listener for when the video ends
    const video = videoRef.current;
    const handleVideoEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      stopProgressLoop();
    };
    if (video) {
      video.addEventListener("ended", handleVideoEnd);
    }
    // Clean up event Listener
    return () => {
      if (video) {
        video.removeEventListener("ended", handleVideoEnd);
      }
      stopProgressLoop();
    };
  }, []);

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const value = parseInt(e.target.value, 10);
      const seekTo = (value / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTo;
      setProgress(value);
    }
  };

  const renderCustomControls = () => {
    return (
      <>
        <button onClick={togglePlayPause}>
          {isPlaying ? (
            <FontAwesomeIcon icon={faPause} />
          ) : (
            <FontAwesomeIcon icon={faPlay} />
          )}
        </button>
        <button onClick={stopVideo}>
          <FontAwesomeIcon icon={faStop} />
        </button>
        <input
          type="range"
          min="0"
          max=" 100"
          value={progress}
          onChange={handleSeek}
        />
        <button onClick={toggleMute}>
          {isMuted ? (
            <FontAwesomeIcon icon={faVolumeXmark} />
          ) : (
            <FontAwesomeIcon icon={faVolumeHigh} />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
        />
        <button onClick={toggleFullscreen}>
          {isFullScreen ? (
            <FontAwesomeIcon icon={faCompress} />
          ) : (
            <FontAwesomeIcon icon={faExpand} />
          )}
        </button>
      </>
    );
  };

  return (
    <>
      <video
        className="video-player"
        ref={videoRef}
        src={src}
        poster={thumbnail}
        onClick={togglePlayPause}
        onPlay={startProgressLoop}
        onPause={stopProgressLoop}
        controls={isNativeControls}
      />
      {isNativeControls ? null : renderCustomControls()}
    </>
  );
}

export default VideoPlayer;
