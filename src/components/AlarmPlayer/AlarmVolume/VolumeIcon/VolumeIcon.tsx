"use client";

import { VolumeDown, VolumeMute, VolumeUp } from "@mui/icons-material";
import { useShallow } from "zustand/react/shallow";

import { useTodoStore } from "@providers/TodoStoreProvider";

const VolumeIcon = () => {
  const { alarmVolume } = useTodoStore(useShallow((state) => state));

  if (alarmVolume > 0.5) {
    return <VolumeUp fontSize="small" />;
  }

  if (alarmVolume > 0 && alarmVolume <= 0.5) {
    return <VolumeDown fontSize="small" />;
  }

  return <VolumeMute fontSize="small" />;
};

export default VolumeIcon;
