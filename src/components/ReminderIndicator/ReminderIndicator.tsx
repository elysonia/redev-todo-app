import { Alarm } from "@mui/icons-material";
import clsx from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { dayjsformatter } from "@utils/dayjsUtils";
import styles from "./reminderIndicator.module.css";

type ReminderIndicatorProps = {
  isActiveFieldArray: boolean;
  sectionFieldName: string;
};

const ReminderIndicator = ({
  isActiveFieldArray,
  sectionFieldName,
}: ReminderIndicatorProps) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  const { control } = useFormContext();

  const reminderDateTime = useWatch({
    control,
    name: `${sectionFieldName}.reminderDateTime`,
  });
  const isReminderExpired = useWatch({
    control,
    name: `${sectionFieldName}.isReminderExpired`,
  });

  const reminderText = useMemo(() => {
    if (isActiveFieldArray) return "";
    const isReminderDateTimeValid = dayjs(reminderDateTime).isValid();
    if (currentTime === null || !isReminderDateTimeValid) return "";
    return dayjsformatter(reminderDateTime, currentTime);
  }, [reminderDateTime, currentTime, isActiveFieldArray]);

  /* Update reminder text every minute. */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => clearInterval(timer);
  }, [setCurrentTime]);

  if (!reminderText) return null;
  return (
    <span
      className={clsx(styles.reminderIndicator, {
        [styles.isOverdue]: isReminderExpired,
      })}
    >
      {reminderText}&nbsp;
      <Alarm style={{ fontSize: "0.8rem" }} />
    </span>
  );
};

export default ReminderIndicator;
