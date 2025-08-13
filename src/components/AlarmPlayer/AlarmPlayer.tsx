"use client";

import {
  Audiotrack,
  EditNotifications,
  NotificationsActive,
  NotificationsOff,
  VolumeDown,
  VolumeMute,
  VolumeUp,
} from "@mui/icons-material";
import {
  ClickAwayListener,
  IconButton,
  MenuItem,
  MenuList,
  Popper,
  Tooltip,
} from "@mui/material";
import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoStore } from "@providers/TodoStoreProvider";
import { alarmMap } from "@utils/alarmUtils";
import { AlarmTypeEnum } from "enums/alarmEnum";
import { debounce } from "lodash";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { isChrome, isEdge, isFirefox } from "react-device-detect";
import { useShallow } from "zustand/react/shallow";
import styles from "./alarmPlayer.module.css";

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
        step={1}
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

const NotificationStatusText = ({
  isNotificationEnabled,
}: {
  isNotificationEnabled: boolean;
}) => {
  const browserSettingsTutorialUrl = useMemo(() => {
    if (isChrome) {
      return "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DDesktop";
    }
    if (isFirefox) {
      return "https://support.mozilla.org/en-US/kb/push-notifications-firefox";
    }
    if (isEdge) {
      return "https://support.microsoft.com/en-us/microsoft-edge/manage-website-notifications-in-microsoft-edge-0c555609-5bf2-479d-a59d-fb30a0b80b2b";
    }
    return "";
  }, [isChrome, isFirefox]);

  return (
    <div className={styles.notificationStatusText}>
      {isNotificationEnabled ? (
        <NotificationsActive fontSize="small" />
      ) : (
        <NotificationsOff fontSize="small" />
      )}
      <span>
        Notifications {isNotificationEnabled ? "enabled" : "disabled"}.
        <br />
        {browserSettingsTutorialUrl ? (
          <a target="_blank" href={browserSettingsTutorialUrl}>
            Learn how to change this setting.
          </a>
        ) : (
          "You may change this in the browser settings."
        )}
      </span>
    </div>
  );
};

const AlarmPlayer = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { audioRef } = useAudioPlayerContext();
  const { alarmType, updateAlarmType } = useTodoStore(
    useShallow((state) => state)
  );
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const alarmObject = alarmMap[alarmType];

  const alarmList = useMemo(() => {
    return Object.values(alarmMap);
  }, []);

  const handleChangeAlarmClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (alarmType: AlarmTypeEnum) => {
    updateAlarmType(alarmType);
  };

  useEffect(() => {
    if ("Notification" in window) {
      setIsNotificationEnabled(Notification.permission === "granted");
    }
  }, [setIsNotificationEnabled]);

  return (
    <div className={styles.alarmPlayerContainer}>
      <audio ref={audioRef} src={alarmObject.filePath} />
      <Tooltip title="Alarm settings">
        <div className={styles.actionButton}>
          <IconButton onClick={handleChangeAlarmClick}>
            <EditNotifications fontSize="large" />
          </IconButton>
          <span>Alarm Settings</span>
        </div>
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
              <div className={styles.currentAlarmText}>
                <Audiotrack fontSize="small" />
                &nbsp;
                {alarmObject.title}
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
