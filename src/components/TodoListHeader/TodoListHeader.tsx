import { Alarm } from "@mui/icons-material";
import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { dayjsformatter } from "@utils/dayjsUtils";
import { TodoSection } from "types";
import styles from "./todoListHeader.module.css";

type TodoListHeaderProps = {
  isActiveFieldArray: boolean;
  sectionFieldName: string;
  onSetSectionActive: (nextFocusedFieldName?: string) => void;
};

const TodoListHeader = ({
  isActiveFieldArray,
  sectionFieldName,
  onSetSectionActive,
}: TodoListHeaderProps) => {
  const fieldName = `${sectionFieldName}.name`;
  const checkboxFieldName = `${sectionFieldName}.isCompleted`;
  const { focusedFieldName, setFocusedFieldName, setSnackbar, onSubmit } =
    useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* TODO: Make tiny components */
  const reminderDateTime = useWatch({
    control,
    name: `${sectionFieldName}.reminderDateTime`,
  });
  const isCompleted = useWatch({
    control,
    name: checkboxFieldName,
  });
  const isReminderExpired = useWatch({
    control,
    name: `${sectionFieldName}.isReminderExpired`,
  });

  const handleFocus = useCallback(() => {
    if (!inputRef.current) return;
    const cursorLocation = inputRef.current.textLength;
    inputRef.current.setSelectionRange(
      cursorLocation,
      cursorLocation,
      "forward"
    );

    /* Record the field name so we can re-focus to it upon re-render on save. */
    setFocusedFieldName(fieldName);
    onSetSectionActive(fieldName);
  }, [setFocusedFieldName, fieldName, onSetSectionActive]);

  const reminderText = useMemo(() => {
    if (isActiveFieldArray) return "";
    const isReminderDateTimeValid = dayjs(reminderDateTime).isValid();
    if (currentTime === null || !isReminderDateTimeValid) return "";
    return dayjsformatter(reminderDateTime, currentTime);
  }, [reminderDateTime, currentTime, isActiveFieldArray]);

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        setTimeout(() => {
          const todoSections = getValues("todoSections");
          const newTodoSections = todoSections.filter(
            (section: TodoSection) => {
              return !section.isCompleted;
            }
          );
          setValue("todoSections", newTodoSections);
          onSubmit();
          setSnackbar({
            open: true,
            message: "Task completed",
          });
        }, 500);
      }
    },
    [getValues, setValue, onSubmit, setSnackbar]
  );

  useEffect(() => {
    handleChecked(isCompleted);
  }, [isCompleted, handleChecked]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName, fieldName, setFocus]);

  /* Update reminder text every minute. */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => clearInterval(timer);
  }, [setCurrentTime]);

  return (
    <div
      className={clsx(styles.listHeaderContainer, {
        [styles.isSectionActive]: isActiveFieldArray,
      })}
    >
      <div>
        {(!isActiveFieldArray || isCompleted) && (
          <Controller
            control={control}
            name={checkboxFieldName}
            render={({ field: { value, onChange } }) => {
              return <Checkbox checked={value} onChange={onChange} />;
            }}
          />
        )}
        <Controller
          control={control}
          name={fieldName}
          render={({ field: { ref: refCallback, value, onChange } }) => {
            return (
              <Input
                inputRef={(ref) => {
                  /* Allow using RHF functions that need refs on this component. */
                  refCallback(ref);
                  /* Access the HTMLElement for more functionality. */
                  inputRef.current = ref;
                }}
                value={value}
                placeholder="Checklist for subtasks"
                className={clsx(styles.listHeader, {
                  [styles.completed]: isCompleted,
                })}
                disableUnderline
                multiline
                onChange={onChange}
                onFocus={handleFocus}
              />
            );
          }}
        />
      </div>
      {reminderText && (
        <span
          className={clsx(styles.alarmText, {
            [styles.isOverdue]: isReminderExpired,
          })}
        >
          {reminderText}&nbsp;
          <Alarm style={{ fontSize: "0.8rem" }} />
        </span>
      )}
    </div>
  );
};

export default TodoListHeader;
