import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { ChangeEvent, FocusEvent, forwardRef, useCallback } from "react";
import {
  Controller,
  RefCallBack,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ReminderIndicator from "@components/ReminderIndicator";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { KeyboardEnum } from "enums";
import { useRefCallback } from "hooks";
import { isNull } from "lodash";
import { TodoSection } from "types";
import { TextInputFieldName } from "types/todo";
import styles from "./todoListHeader.module.css";

type ListHeaderInputProps = {
  refCallback: RefCallBack;
  isCompleted: boolean;
  isActiveFieldArray: boolean;
  value: string;
  onFocus: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const ListHeaderInput = forwardRef<HTMLTextAreaElement, ListHeaderInputProps>(
  function ListHeaderInput(props: ListHeaderInputProps, ref) {
    const {
      refCallback,
      isCompleted,
      isActiveFieldArray,
      value,
      onFocus,
      onChange,
      onKeyDown,
    } = props;

    return (
      <Input
        inputRef={useRefCallback<HTMLTextAreaElement>(refCallback)}
        className={clsx(styles.headerInput, {
          [styles.completed]: isCompleted,
        })}
        slotProps={{
          input: {
            tabIndex: isActiveFieldArray ? 0 : -1,
          },
        }}
        value={value}
        placeholder="Checklist for subtasks"
        disableUnderline
        multiline
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
    );
  }
);

type ListHeaderCheckboxProps = {
  refCallback: RefCallBack;
  isCompleted: boolean;
  isActiveFieldArray: boolean;
  value: boolean;
  onBlur?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChecked: (checked: boolean) => void;
};

const ListHeaderCheckbox = (props: ListHeaderCheckboxProps) => {
  const { isActiveFieldArray, value, refCallback, onChange, onChecked } = props;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event);
      onChecked(event.target.checked);
    },
    [onChange, onChecked]
  );

  return (
    <Checkbox
      slotProps={{
        input: {
          ref: useRefCallback<HTMLInputElement>(refCallback),
          tabIndex: isActiveFieldArray ? -1 : 0,
        },
      }}
      checked={value}
      disabled={isActiveFieldArray}
      onChange={handleChange}
    />
  );
};

type TodoListHeaderProps = {
  isActiveFieldArray: boolean;
  sectionFieldName: string;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

const TodoListHeader = ({
  isActiveFieldArray,
  sectionFieldName,
  onKeyDown,
}: TodoListHeaderProps) => {
  const fieldName = `${sectionFieldName}.name` as TextInputFieldName;
  const checkboxFieldName = `${sectionFieldName}.isCompleted`;
  const {
    focusedTextInputField,
    setFocusedTextInputField,
    setSectionFieldArrayName,
    setSnackbar,
    onSubmit,
  } = useTodoContext();
  const { control, setValue, getValues } = useFormContext();

  const isCompleted = useWatch({
    control,
    name: checkboxFieldName,
  });

  const shouldShowCheckbox = !isActiveFieldArray || isCompleted;

  const getInputState = (ref: HTMLTextAreaElement | null) => {
    if (!ref) {
      return {
        value: "",
        selectionStart: 0,
        length: 0,
      };
    }

    return {
      value: ref.value,
      selectionStart: ref.selectionStart,
      length: ref.value.length,
    };
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isActiveFieldArray) return;
      if (event.key === KeyboardEnum.KeyEnum.tab) {
        onKeyDown(event);
        return;
      }
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);

      const shouldFocusOnFirstSubtask =
        event.key === "ArrowDown" &&
        inputState.selectionStart === inputState.length;

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
    [sectionFieldName, isActiveFieldArray, setFocusedTextInputField]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLTextAreaElement>) => {
      const target = event.target as HTMLTextAreaElement;
      const inputState = getInputState(target);
      const eventCursorLocation = event?.target?.selectionStart;

      const shouldFocusAtStartOrMiddle =
        focusedTextInputField.fieldName === fieldName &&
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart >= 0;

      const shouldFocusAtEnd =
        !isNull(focusedTextInputField.selectionStart) &&
        focusedTextInputField.selectionStart < 0;

      const cursorLocation = shouldFocusAtEnd
        ? inputState.length
        : shouldFocusAtStartOrMiddle
        ? focusedTextInputField.selectionStart
        : eventCursorLocation;

      target.setSelectionRange(cursorLocation, cursorLocation, "forward");
      setSectionFieldArrayName(sectionFieldName as `todoSections.${number}`);
    },
    [
      fieldName,
      sectionFieldName,
      focusedTextInputField,
      setSectionFieldArrayName,
    ]
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
            render={({ field: { ref: refCallback, value, onChange } }) => {
              return (
                <ListHeaderCheckbox
                  value={value}
                  isCompleted={isCompleted}
                  isActiveFieldArray={isActiveFieldArray}
                  refCallback={refCallback}
                  onChange={onChange}
                  onChecked={handleChecked}
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
              <ListHeaderInput
                refCallback={refCallback}
                isCompleted={isCompleted}
                isActiveFieldArray={isActiveFieldArray}
                value={value}
                onFocus={handleFocus}
                onChange={onChange}
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
