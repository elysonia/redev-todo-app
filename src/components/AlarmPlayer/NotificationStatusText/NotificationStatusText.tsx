"use client";

import { NotificationsActive, NotificationsOff } from "@mui/icons-material";
import { useMemo } from "react";
import { isChrome, isEdge, isFirefox } from "react-device-detect";

import styles from "./notificationStatusText.module.css";

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
  }, []);

  return (
    <div className={styles.notificationStatusText}>
      {isNotificationEnabled ? (
        <NotificationsActive fontSize="small" />
      ) : (
        <NotificationsOff fontSize="small" />
      )}
      <span>
        Alarms will{" "}
        {isNotificationEnabled
          ? "have desktop notifications"
          : "not have desktop notifications"}
        .
        {browserSettingsTutorialUrl ? (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={browserSettingsTutorialUrl}
          >
            Learn how to change this setting.
          </a>
        ) : (
          "You may change this in the browser settings."
        )}
      </span>
    </div>
  );
};

export default NotificationStatusText;
