"use client";
import { debounce } from "lodash";
import { ChangeEvent, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoStore } from "@providers/TodoStoreProvider";
import VolumeIcon from "./VolumeIcon";
import styles from "./alarmVolume.module.css";

const AlarmVolume = () => {
  const { audioRef } = useAudioPlayerContext();
  const { updateAlarmVolume } = useTodoStore(useShallow((state) => state));

  const handleVolumeChange = useCallback(
    debounce((event: ChangeEvent<HTMLInputElement>) => {
      updateAlarmVolume(Number(event.target.value) / 100);
    }, 500),
    [updateAlarmVolume]
  );

  return (
    <div className={styles.alarmVolume}>
      <VolumeIcon />
      <input
        id="alarmVolume"
        name="alarmVolume"
        type="range"
        min={0}
        max={100}
        aria-label="volume"
        onChange={(event) => {
          if (audioRef?.current) {
            audioRef.current.volume = Number(event.target.value) / 100;
          }
          handleVolumeChange(event);
        }}
      />
    </div>
  );
};

export default AlarmVolume;
