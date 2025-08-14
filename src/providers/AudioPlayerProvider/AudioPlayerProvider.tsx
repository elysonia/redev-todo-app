"use client";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { isEmpty } from "lodash";
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useShallow } from "zustand/shallow";

type AudioPlayerContextProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isPlayable: boolean;
  onPlayAudio: () => void;
  onStopAudio: () => void;
};

const defaultAudioPlayerContext: AudioPlayerContextProps = {
  audioRef: { current: null },
  isPlaying: false,
  isPlayable: false,
  onPlayAudio: () => {},
  onStopAudio: () => {},
};

const AudioPlayerContext = createContext<AudioPlayerContextProps>(
  defaultAudioPlayerContext
);

const AudioPlayerProvider = ({ children }: PropsWithChildren) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayable, setIsPlayable] = useState(false);
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
          console.error("Error:", error);
        });
    }
  }, [alarmVolume, setIsPlaying]);

  const handleStopAudio = useCallback(() => {
    if (!isEmpty(audioRef.current)) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [setIsPlaying]);

  const audioPlayerValue: AudioPlayerContextProps = useMemo(() => {
    return {
      audioRef,
      isPlaying,
      isPlayable,
      onPlayAudio: handlePlayAudio,
      onStopAudio: handleStopAudio,
    };
  }, [audioRef, isPlaying, isPlayable, handlePlayAudio, handleStopAudio]);

  useEffect(() => {
    const handleCanPlayThrough = () => {
      setIsPlayable(true);
    };

    const handleEnded = () => {
      if (!isEmpty(audioRef.current)) {
        audioRef.current.load();
        setIsPlaying(false);
      }
    };

    if (!isEmpty(audioRef.current)) {
      audioRef.current.addEventListener("canplaythrough", handleCanPlayThrough);
      audioRef.current.addEventListener("ended", handleEnded);
    }

    return () => {
      if (!isEmpty(audioRef.current)) {
        audioRef.current.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough
        );
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, [setIsPlayable]);

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
