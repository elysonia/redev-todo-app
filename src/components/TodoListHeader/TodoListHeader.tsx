import { Alarm } from "@mui/icons-material";
import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { dayjsformatter } from "@utils/dayjsUtils";
import { defaultTodoSection } from "@utils/todoUtils";
import dayjs, { Dayjs } from "dayjs";
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
  const { focusedFieldName, setFocusedFieldName } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const [currentTime, setCurrentTime] = useState<Dayjs | null>(null);
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
  }, [setFocusedFieldName, fieldName]);

  const reminderText = useMemo(() => {
    if (!reminderDateTime) return "";
    return dayjsformatter(reminderDateTime);
  }, [reminderDateTime, currentTime]);

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        setTimeout(() => {
          const todoSection = getValues(sectionFieldName);
          const todoSections = getValues("todoSections");
          const newTodoSections = todoSections.filter(
            (section: TodoSection) => section.id !== todoSection.id
          );
          setValue("todoSections", newTodoSections);
        }, 500);
      }
    },
    [sectionFieldName]
  );

  useEffect(() => {
    handleChecked(isCompleted);
  }, [isCompleted, handleChecked]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

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
                placeholder={defaultTodoSection.name}
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
      {reminderText && !isActiveFieldArray && (
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
