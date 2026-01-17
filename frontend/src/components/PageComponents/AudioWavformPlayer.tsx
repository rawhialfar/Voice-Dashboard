import { useEffect, useRef, useState, useContext } from 'react';
import WavesurferPlayer from '@wavesurfer/react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext'; // Adjust the import path as needed

interface Props {
  selectedConversation: {
    recordingUrl: string;
  };
}

const AudioWaveformPlayer = ({ selectedConversation }: Props) => {
  const [wavesurfer, setWavesurfer] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const keyRef = useRef(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (!wavesurfer) return;

    const updateTime = () => setCurrentTime(wavesurfer.getCurrentTime());
    const updateDuration = () => setDuration(wavesurfer.getDuration());

    wavesurfer.on("audioprocess", updateTime);
    wavesurfer.on("seek", updateTime);
    wavesurfer.on("ready", updateDuration);

    return () => {
      wavesurfer.un("audioprocess", updateTime);
      wavesurfer.un("seek", updateTime);
      wavesurfer.un("ready", updateDuration);
    };
  }, [wavesurfer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (wavesurfer && selectedConversation?.recordingUrl) {
      wavesurfer.load(selectedConversation.recordingUrl);
    }
  }, [selectedConversation, wavesurfer]);

  useEffect(() => {
    if (selectedConversation?.recordingUrl) {
      setAudioUrl(selectedConversation.recordingUrl);
      keyRef.current += 1;
    }
  }, [selectedConversation]);

  const togglePlayPause = () => {
    wavesurfer?.playPause();
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    wavesurfer?.setPlaybackRate(nextRate);
  };

  const toggleMute = () => {
    if (wavesurfer) {
      const newMuteState = !isMuted;
      wavesurfer.setVolume(newMuteState ? 0 : 1);
      setIsMuted(newMuteState);
    }
  };

  // Define colors based on theme
  const waveColor = isDarkMode ? "#8a939fff" : "#aaa";
  const progressColor = isDarkMode ? "#818CF8" : "#6366f1";
  const cursorColor = isDarkMode ? "#818CF8" : "#6366f1";
  const bgColor = isDarkMode ? "bg-gray-800" : "bg-gray-100";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-300";
  const textColor = isDarkMode ? "text-gray-300" : "text-gray-600";
  const buttonColor = isDarkMode ? "bg-indigo-600" : "bg-blue-600";
  const buttonHoverColor = isDarkMode ? "hover:bg-indigo-700" : "hover:bg-blue-700";
  const buttonPressedColor = isDarkMode ? "bg-indigo-700" : "bg-blue-700";
  const downloadLinkColor = isDarkMode ? "text-indigo-400 hover:text-indigo-300" : "text-blue-600 hover:text-blue-800";

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} z-10 px-4 py-3 overflow-y-auto`}>
      
      <div className="cursor-pointer w-full">
        {audioUrl && (
          <WavesurferPlayer
            key={keyRef.current}
            height={80}
            waveColor={waveColor}
            progressColor={progressColor}
            cursorColor={cursorColor}
            dragToSeek
            barWidth={2}
            barGap={2}
            url={audioUrl}
            onReady={(ws) => {
              setWavesurfer(ws);
              setIsPlaying(false);
              ws.setPlaybackRate(playbackRate);

              ws.on("seeking", (progress) => {
                const duration = ws.getDuration();
                const newTime = progress as number * duration;
                setCurrentTime(newTime);
              });
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>
      
      <div className="flex mt-4">
        <div className="flex items-center 2xl:justify-center justify-start space-x-1 2xl:space-x-2 lg:w-[calc(100%+60px)] 2xl:ml-[50px] justify-between w-full">
          <button
            onClick={toggleMute}
            className={`2xl:w-10 2xl:h-10 w-3 h-9 flex items-center justify-center rounded-full transition-all duration-200
              ${isMuted 
                ? `${buttonPressedColor} shadow-inner scale-95`
                : `${buttonColor} shadow-md hover:shadow-lg hover:scale-105`}
              text-white`}
          >
            <span>{isMuted ? <VolumeX className="2xl:w-5 2xl:h-5 h-4 w-4" /> : <Volume2 className="2xl:w-5 2xl:h-5 h-4 w-4" />}</span>
          </button>
          
          <button
            onClick={() => {
              const currentTime = wavesurfer?.getCurrentTime() || 0;
              wavesurfer?.setTime(Math.max(currentTime - 10, 0));
            }}
            className={`2xl:w-10 2xl:h-10 w-3 h-9 flex items-center justify-center rounded-full ${buttonColor} text-white 
                      shadow-lg ${buttonHoverColor} transition-all transform active:scale-70`}
            title="Rewind 10 seconds"
          >
            <span><SkipBack className="2xl:w-5 2xl:h-5 h-4 w-4" /></span>
          </button>
          
          <button
            onClick={togglePlayPause}
            className={`2xl:w-13 2xl:h-13 w-10 h-11 flex items-center justify-center rounded-full transition-all ${buttonHoverColor} duration-200
              ${isPlaying 
                ? `${buttonPressedColor} shadow-inner scale-95`
                : `${buttonColor} shadow-md hover:shadow-lg hover:scale-105`}
              text-white`}
          >
            <span className=''>{isPlaying ? <Pause /> : <Play />}</span>
          </button>
          
          <button
            onClick={() => {
              const currentTime = wavesurfer?.getCurrentTime() || 0;
              const duration = wavesurfer?.getDuration() || 0;
              wavesurfer?.setTime(Math.min(currentTime + 10, duration));
            }}
            className={`2xl:w-10 2xl:h-10 w-3 h-9 flex items-center justify-center rounded-full ${buttonColor} text-white 
              shadow-lg ${buttonHoverColor} transition-all transform active:scale-70`}
            title="Fast forward 10 seconds"
          >
            <span><SkipForward className="2xl:w-5 2xl:h-5 h-4 w-4" /></span>
          </button>
          
          <button
            onClick={toggleSpeed}
            className={`2xl:w-10 2xl:h-10 w-3 h-9 flex items-center justify-center rounded-full transition-all duration-200 text-xs font-semibold
              ${playbackRate > 1 
                ? `${buttonPressedColor} shadow-inner scale-95` 
                : `${buttonColor} ${buttonHoverColor} shadow-md hover:shadow-lg hover:scale-105`} 
              text-white`}
          >
            <span className='2xl:text-lg text-sm'>{playbackRate}x</span>
          </button>
        </div>

        <div className="flex flex-col space-y-2 items-end whitespace-nowrap ml-10 2xl:ml-0">
          <span className={`text-sm ${textColor}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <Link
            to={selectedConversation.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className={`text-sm font-semibold cursor-pointer transition-colors ${downloadLinkColor}`}>
              Download WAV
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AudioWaveformPlayer;