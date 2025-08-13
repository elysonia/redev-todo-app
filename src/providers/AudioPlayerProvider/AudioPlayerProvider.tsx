"use client";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/shallow";

type AudioPlayerContextProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
};

const defaultAudioPlayerContext: AudioPlayerContextProps = {
  audioRef: { current: null },
  isPlaying: false,
  onPlayAudio: () => {},
  onPauseAudio: () => {},
};

const AudioPlayerContext = createContext<AudioPlayerContextProps>(
  defaultAudioPlayerContext
);

const AudioPlayerProvider = ({ children }: PropsWithChildren) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { alarmVolume } = useTodoStore(useShallow((state) => state));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = useCallback(() => {
    if (!isEmpty(audioRef.current)) {
      audioRef.current.volume = alarmVolume;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  }, [alarmVolume, setIsPlaying]);

  const handlePauseAudio = () => {
    if (!isEmpty(audioRef.current)) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const audioPlayerValue: AudioPlayerContextProps = useMemo(() => {
    return {
      audioRef,
      isPlaying,
      onPlayAudio: handlePlayAudio,
      onPauseAudio: handlePauseAudio,
    };
  }, [audioRef, isPlaying, handlePlayAudio, handlePauseAudio]);

  return (
    <AudioPlayerContext.Provider value={audioPlayerValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayerContext must be used within an AudioPlayerProvider"
    );
  }

  return context;
};

export default AudioPlayerProvider;
