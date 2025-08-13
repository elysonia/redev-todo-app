"use client";
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useMemo,
  useRef,
} from "react";

type AudioPlayerContextProps = {
  audioRef: RefObject<HTMLAudioElement>;
};

const AudioPlayerContext = createContext<AudioPlayerContextProps>({});

const AudioPlayerProvider = ({ children }: PropsWithChildren) => {
  const audioRef = useRef<HTMLAudioElement>({});

  const audioPlayerValue: AudioPlayerContextProps = useMemo(() => {
    return { audioRef };
  }, [audioRef]);

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
