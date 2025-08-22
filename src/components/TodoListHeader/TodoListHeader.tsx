import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { FocusEvent, useCallback, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import ReminderIndicator from "@components/ReminderIndicator";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { isNull } from "lodash";
import { TodoSection } from "types";
import { TextInputFieldName } from "types/todo";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fieldName = `${sectionFieldName}.name` as TextInputFieldName;
  const checkboxFieldName = `${sectionFieldName}.isCompleted`;
  const {
    focusedTextInputField,
    setFocusedTextInputField,
    setSnackbar,
    onSubmit,
  } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();

  const isCompleted = useWatch({
    control,
    name: checkboxFieldName,
  });

  const shouldShowCheckbox = !isActiveFieldArray || isCompleted;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const shouldFocusOnFirstSubtask =
        event.key === "ArrowDown" &&
        inputRef.current?.selectionStart === inputRef?.current?.textLength;

      if (shouldFocusOnFirstSubtask) {
        event.preventDefault();
        const nextFieldName =
          `${sectionFieldName}.list.0.text` as TextInputFieldName;

        setFocusedTextInputField({
          fieldName: nextFieldName,
          selectionStart: -1,
        });
      }
    },
    [sectionFieldName, setFocusedTextInputField]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLTextAreaElement>) => {
      if (!inputRef.current) return;
      const eventCursorLocation = event?.target?.selectionStart;
      const shouldFocusAtStartOrMiddle =
        focusedTextInputField.fieldName === fieldName &&
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart >= 0;
      const shouldFocusAtEnd =
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart < 0;

      const cursorLocation = shouldFocusAtEnd
        ? inputRef.current.textLength
        : shouldFocusAtStartOrMiddle
        ? focusedTextInputField.selectionStart
        : eventCursorLocation;

      inputRef.current.setSelectionRange(
        cursorLocation,
        cursorLocation,
        "forward"
      );

      onSetSectionActive(sectionFieldName);
    },
    [setFocusedTextInputField, fieldName, sectionFieldName, onSetSectionActive]
  );

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (!isChecked) return;
      /* Delay the function for 3 ms so the feedback for the delete action doesn't feel so sudden. */
      setTimeout(() => {
        const todoSections = getValues("todoSections");
        const currentSection = getValues(sectionFieldName);
        const newTodoSections = todoSections.filter((section: TodoSection) => {
          return section.id !== currentSection.id;
        });
        setValue("todoSections", newTodoSections);
        onSubmit();
        setSnackbar({
          open: true,
          message: "Task completed",
        });
      }, 300);
    },
    [getValues, setValue, sectionFieldName, onSubmit, setSnackbar]
  );

  return (
    <div
      className={clsx(styles.listHeaderContainer, {
        [styles.isSectionActive]: isActiveFieldArray,
      })}
    >
      <div className={styles.listHeader}>
        {shouldShowCheckbox && (
          <Controller
            control={control}
            name={checkboxFieldName}
            render={({ field: { value, onChange } }) => {
              return (
                <Checkbox
                  checked={value}
                  onChange={(event) => {
                    onChange(event);
                    handleChecked(event.target.checked);
                  }}
                />
              );
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
                className={clsx(styles.headerInput, {
                  [styles.completed]: isCompleted,
                })}
                disableUnderline
                multiline
                onChange={onChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
              />
            );
          }}
        />
      </div>
      <ReminderIndicator
        isActiveFieldArray={isActiveFieldArray}
        sectionFieldName={sectionFieldName}
      />
    </div>
  );
};

export default TodoListHeader;
