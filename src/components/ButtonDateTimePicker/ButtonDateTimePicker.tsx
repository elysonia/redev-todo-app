import { Alarm } from "@mui/icons-material";
import { Button, useForkRef } from "@mui/material";
import {
  DateTimePickerFieldProps,
  MobileDateTimePicker,
  MobileDateTimePickerProps,
} from "@mui/x-date-pickers";
import {
  usePickerContext,
  useSplitFieldProps,
} from "@mui/x-date-pickers/hooks";
import { useValidation, validateDate } from "@mui/x-date-pickers/validation";
import dayjs from "dayjs";
import React, { forwardRef, useCallback, useMemo } from "react";

import { dayjsformatter } from "@utils/dayjsUtils";
import { HTMLDivButtonElement } from "types";

const ButtonDateTimeField = forwardRef<
  HTMLButtonElement,
  DateTimePickerFieldProps
>(function ButtonDateTimeField(props: DateTimePickerFieldProps, ref) {
  const { internalProps, forwardedProps } = useSplitFieldProps(
    props,
    "date-time"
  );

  const pickerContext = usePickerContext();
  const handleRef = useForkRef(
    ref,
    pickerContext.triggerRef,
    pickerContext.rootRef
  );
  const { hasValidationError } = useValidation({
    validator: validateDate,
    value: pickerContext.value,
    timezone: pickerContext.timezone,
    props: internalProps,
  });

  const isAlarmExpired = useMemo(() => {
    return dayjs(pickerContext.value).isBefore(dayjs());
  }, [pickerContext]);

  const valueStr = useMemo(() => {
    return pickerContext.value == null
      ? "Set reminder"
      : dayjsformatter(pickerContext.value);
  }, [pickerContext]);

  const handleClick = useCallback(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
      pickerContext.setOpen((prev) => !prev);
    }
  }, [pickerContext]);
  return (
    <Button
      {...forwardedProps}
      variant="text"
      color={hasValidationError || isAlarmExpired ? "error" : "inherit"}
      ref={handleRef}
      className={pickerContext.rootClassName}
      style={{ padding: "4px 18px", borderRadius: "15px" }}
      sx={pickerContext.rootSx}
      onClick={handleClick}
    >
      {valueStr}&nbsp;
      <Alarm fontSize="small" />
    </Button>
  );
});

const ButtonFieldDateTimePicker = forwardRef<
  HTMLDivButtonElement,
  MobileDateTimePickerProps
>(function ButtonFieldDateTimePicker(props: MobileDateTimePickerProps, ref) {
  return (
    <MobileDateTimePicker
      {...props}
      slots={{ ...props.slots, field: ButtonDateTimeField }}
      slotProps={{
        ...props.slotProps,

        field: {
          ref,
          ...(props?.slotProps?.field || {}),
        },
      }}
    />
  );
});

export default React.memo(ButtonFieldDateTimePicker);
