"use client";

import { Audiotrack, EditNotifications } from "@mui/icons-material";
import {
  Button,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Popper,
  Tooltip,
} from "@mui/material";
import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { alarmMap } from "@utils/alarmUtils";
import { AlarmTypeEnum } from "enums/alarmEnum";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import styles from "./alarmPlayer.module.css";
import AlarmPreviewEndIcon from "./AlarmPreviewEndIcon";
import AlarmVolume from "./AlarmVolume";
import NotificationStatusText from "./NotificationStatusText";

const AlarmPlayer = () => {
  const { audioRef, isPlayable, isPlaying, onPlayAudio, onStopAudio } =
    useAudioPlayerContext();
  const { alarmType, updateAlarmType } = useTodoStore(
    useShallow((state) => state)
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isAutoplayNext, setIsAutoplayNext] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const alarmObject = alarmMap[alarmType];
  const alarmPreviewTooltipTitle = isPlaying
    ? "Stop alarm preview"
    : "Preview alarm sound";

  const alarmList = useMemo(() => {
    return Object.values(alarmMap);
  }, []);

  const handleAlarmSettingsButton = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (anchorEl) {
      handleClose();
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = useCallback(
    (nextAlarmType: AlarmTypeEnum) => {
      updateAlarmType(nextAlarmType);

      if (isPlaying) {
        /* Indicates the new alarm should autoplay if it was picked while the previous one is still playing. */
        setIsAutoplayNext(true);
        onStopAudio();
      }
    },
    [isPlaying, onStopAudio, setIsAutoplayNext, updateAlarmType]
  );

  const handlePreviewAlarm = useCallback(() => {
    if (isPlaying) {
      onStopAudio();
      return;
    }
    onPlayAudio();
  }, [isPlaying, onPlayAudio, onStopAudio]);

  useEffect(() => {
    if ("Notification" in window) {
      setIsNotificationEnabled(Notification.permission === "granted");
    }
  }, [setIsNotificationEnabled]);

  /* If the alarm sound should autoplay, call the play function once the data is loaded fully. */
  useEffect(() => {
    if (isAutoplayNext && isPlayable) {
      onPlayAudio();
      setIsAutoplayNext(false);
    }
  }, [isPlayable, isAutoplayNext, setIsAutoplayNext, onPlayAudio]);

  return (
    <div className={styles.alarmPlayerContainer}>
      <audio ref={audioRef} src={alarmObject.filePath} />
      <Tooltip title="Alarm settings">
        <Button
          classes={{ root: styles.actionButton }}
          onClick={handleAlarmSettingsButton}
        >
          <EditNotifications fontSize="large" />
          <span>Alarm Settings</span>
        </Button>
      </Tooltip>

      <ClickAwayListener
        mouseEvent={anchorEl ? "onMouseDown" : false}
        touchEvent={anchorEl ? "onTouchStart" : false}
        onClickAway={handleClose}
      >
        <Popper
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          className={styles.alarmSettingsContainer}
        >
          <NotificationStatusText
            isNotificationEnabled={isNotificationEnabled}
          />

          <div className={styles.alarmSettings}>
            <AlarmVolume />
            <div className={styles.alarmSound}>
              <div className={styles.currentAlarmPreview}>
                <Tooltip title={alarmPreviewTooltipTitle}>
                  <Button
                    startIcon={<Audiotrack fontSize="small" />}
                    endIcon={<AlarmPreviewEndIcon isPlaying={isPlaying} />}
                    onClick={handlePreviewAlarm}
                  >
                    {alarmObject.title}
                  </Button>
                </Tooltip>
              </div>

              <MenuList>
                {alarmList.map((alarm) => {
                  return (
                    <MenuItem
                      key={alarm.id}
                      selected={alarm.id === alarmType}
                      onClick={() => handleMenuItemClick(alarm.id)}
                    >
                      {alarm.title}
                    </MenuItem>
                  );
                })}
              </MenuList>
            </div>
          </div>
        </Popper>
      </ClickAwayListener>
    </div>
  );
};

export default AlarmPlayer;
