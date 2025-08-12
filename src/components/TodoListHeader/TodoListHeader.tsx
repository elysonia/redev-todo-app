import { Checkbox, Input } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Alarm } from "@mui/icons-material";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { dayjsformatter } from "@utils/dayjsUtils";
import { defaultTodoSection } from "@utils/todoUtils";
import clsx from "clsx";
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
  const [isChecked, setIsChecked] = useState(false);
  const { focusedFieldName, setFocusedFieldName } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reminderDateTime = useWatch({
    control,
    name: `${sectionFieldName}.reminderDateTime`,
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
  }, [reminderDateTime]);

  const handleRemove = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.stopPropagation();
      setIsChecked(event.target.checked);

      if (event.target.checked) {
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
    [sectionFieldName, setIsChecked]
  );

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <div
      className={clsx(styles.listHeaderContainer, {
        [styles.isSectionActive]: isActiveFieldArray,
      })}
    >
      <div>
        {(!isActiveFieldArray || isChecked) && (
          <Checkbox onChange={handleRemove} />
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
        <span className={styles.alarmText}>
          {reminderText}&nbsp;
          <Alarm fontSize="0.8rem" />
        </span>
      )}
    </div>
  );
};

export default TodoListHeader;
