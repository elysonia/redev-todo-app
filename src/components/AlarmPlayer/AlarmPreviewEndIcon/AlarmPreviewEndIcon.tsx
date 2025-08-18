"use client";

import { PauseCircleFilled, PlayCircleFilled } from "@mui/icons-material";

const AlarmPreviewEndIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  if (isPlaying) return <PauseCircleFilled />;
  return <PlayCircleFilled />;
};

export default AlarmPreviewEndIcon;
