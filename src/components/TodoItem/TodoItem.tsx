import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { isEmpty, isNull, uniqueId } from "lodash";
import { FocusEvent, useCallback, useRef } from "react";
import {
  Controller,
  UseFieldArrayReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ReminderIndicator from "@components/ReminderIndicator";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import {
  defaultFocusedTextInputField,
  getDefaultTodoItem,
} from "@utils/todoUtils";
import { KeyboardEnum } from "enums";
import { TodoItem as TodoItemType, TodoSection } from "types";
import { FocusedTextInputField, TextInputFieldName } from "types/todo";
import styles from "./todoItem.module.css";

type TodoItemProps = {
  itemIndex: number;
  sectionIndex: number;
  sectionFieldName: string;
  listFieldName: string;
  shouldShowHeader: boolean;
  listFieldArrayMethods: UseFieldArrayReturn;
  onSetSectionActive: (nextFocusedFieldName?: string) => void;
};

const TodoItem = ({
  itemIndex,
  sectionIndex,
  listFieldName,
  shouldShowHeader,
  sectionFieldName,
  listFieldArrayMethods,
  onSetSectionActive,
}: TodoItemProps) => {
  const {
    sectionFieldArrayName,
    focusedTextInputField,
    setFocusedTextInputField,
    onSubmit,
    setSnackbar,
  } = useTodoContext();
  const fieldName = `${listFieldName}.${itemIndex}.text` as TextInputFieldName;
  const { control, setValue, getValues } = useFormContext();
  const { move, insert, remove } = listFieldArrayMethods;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;

  const getInputState = () => {
    if (!inputRef.current) {
      return {
        value: "",
        selectionStart: 0,
        length: 0,
      };
    }

    return {
      value: inputRef.current.value,
      selectionStart: inputRef.current.selectionStart,
      length: inputRef.current.value.length,
    };
  };

  const handleBackspaceKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const inputState = getInputState();
      const isCursorAtStart = inputState.selectionStart === 0;
      if (!isCursorAtStart) return;

      event.preventDefault();
      const todoSections = getValues("todoSections");
      const currentSection = todoSections[sectionIndex];
      const isFirstItem = itemIndex === 0;
      const isTextEmpty = inputState.length === 0;
      const hasNoSubtasks = currentSection.list.length === 1;

      const shouldCreateTaskFromTitle =
        isFirstItem && hasNoSubtasks && !!currentSection.name;

      if (shouldCreateTaskFromTitle) {
        const newTodoSections = todoSections.map((section: TodoSection) => {
          if (section.id === currentSection.id) {
            const newTodoItem = {
              ...getDefaultTodoItem(),
              text: section.name + currentSection.list[itemIndex].text,
            };

            return { ...section, name: "", list: [newTodoItem] };
          }
          return section;
        });

        const nextFocusedFieldName =
          `${listFieldName}.0.text` as TextInputFieldName;
        setValue("todoSections", newTodoSections);
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: currentSection.name.length,
        });
        return;
      }

      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const nextFocusedFieldName = (
        isPrevItemIndexValid
          ? `${listFieldName}.${prevItemIndex}.text`
          : `${listFieldName}.0.text`
      ) as TextInputFieldName;

      const shouldRemoveItem = isTextEmpty;
      if (shouldRemoveItem) {
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: -1,
        });
        remove(itemIndex);
        return;
      }

      const shouldMergeWithPrevText = !isFirstItem;
      if (shouldMergeWithPrevText) {
        const newPrevItemText =
          currentSection.list[prevItemIndex].text + inputRef?.current?.value;
        const prevItemLength = currentSection.list[prevItemIndex].text.length;

        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: prevItemLength,
        });
        setValue(`${listFieldName}.${prevItemIndex}.text`, newPrevItemText);
        remove(itemIndex);
      }
    },
    [
      itemIndex,
      sectionIndex,
      listFieldName,
      remove,
      setValue,
      getValues,
      setFocusedTextInputField,
    ]
  );

  const handleEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const inputState = getInputState();
      /* Prevent key press from adding an extra newline. */
      event.preventDefault();
      const nextItemIndex = itemIndex + 1;

      const newCurrentItemText = inputState.value.slice(
        0,
        inputState.selectionStart
      );
      const nextItemText = inputState.value.slice(inputState.selectionStart);
      setValue(fieldName, newCurrentItemText);
      insert(nextItemIndex, {
        id: uniqueId(),
        isCompleted: false,
        text: nextItemText,
      });

      const nextItemFieldName =
        `${listFieldName}.${nextItemIndex}.text` as TextInputFieldName;

      setFocusedTextInputField({
        fieldName: nextItemFieldName,
        selectionStart: 0,
      });
    },
    [
      itemIndex,
      fieldName,
      listFieldName,
      insert,
      setValue,
      setFocusedTextInputField,
    ]
  );

  const handleArrowKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const inputState = getInputState();
      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const currentSection = getValues(sectionFieldName);

      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < currentSection.list.length;

      const shouldFocusOnPrevItem =
        event.key === "ArrowUp" &&
        inputState.selectionStart === 0 &&
        isPrevItemIndexValid;

      const shouldFocusOnHeaderName =
        event.key === "ArrowUp" &&
        inputState.selectionStart === 0 &&
        !isPrevItemIndexValid;

      const shouldFocusOnNextItem =
        event.key === "ArrowDown" &&
        inputState.selectionStart === inputRef?.current?.textLength &&
        isNextItemIndexValid;

      /* Only prevent default cursor behavior when they need to move focus to another field */
      if (
        shouldFocusOnPrevItem ||
        shouldFocusOnHeaderName ||
        shouldFocusOnNextItem
      ) {
        event.preventDefault();
      }

      const nextFocusedField = (() => {
        if (shouldFocusOnPrevItem) {
          return {
            fieldName: `${listFieldName}.${prevItemIndex}.text`,
            selectionStart: 0,
          };
        }
        if (shouldFocusOnHeaderName) {
          return { fieldName: `${sectionFieldName}.name`, selectionStart: 0 };
        }
        if (shouldFocusOnNextItem) {
          return {
            fieldName: `${listFieldName}.${nextItemIndex}.text`,
            selectionStart: -1,
          };
        }
        return { fieldName: "", selectionStart: null };
      })() as FocusedTextInputField;

      /* Prevent calling setFocusedTextInputField when the focus should not change. */
      if (
        isEmpty(nextFocusedField.fieldName) &&
        isEmpty(nextFocusedField.selectionStart)
      ) {
        return;
      }

      setFocusedTextInputField(nextFocusedField);
    },
    [
      itemIndex,
      getValues,
      listFieldName,
      sectionFieldName,
      setFocusedTextInputField,
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case KeyboardEnum.KeyEnum.enter:
          handleEnterKey(event);
          break;
        case KeyboardEnum.KeyEnum.arrowUp:
        case KeyboardEnum.KeyEnum.arrowDown:
          handleArrowKey(event);
          break;
        case KeyboardEnum.KeyEnum.backspace:
          handleBackspaceKey(event);
          break;
      }
    },
    [handleEnterKey, handleArrowKey, handleBackspaceKey]
  );

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (isActiveFieldArray) return;
      setTimeout(() => {
        if (!isChecked) {
          move(itemIndex, 0);
          return;
        }

        const todoSections = getValues("todoSections");
        const todoSection = todoSections[sectionIndex];
        const todoItem = todoSection.list[itemIndex];

        const newIncompleteTodoList = todoSection.list.filter(
          (item: TodoItemType) => {
            return !item.isCompleted;
          }
        );

        const isAllSubtasksCompleted = newIncompleteTodoList.length === 0;
        if (isAllSubtasksCompleted) {
          const newTodoSections = todoSections.filter(
            (section: TodoSection) => {
              return section.id !== todoSection.id;
            }
          );

          setValue("todoSections", newTodoSections);
          onSubmit();
          setSnackbar({
            open: true,
            message: "Task completed",
          });
          return;
        }

        const latestCompletedListItemIndex = todoSection.list.findIndex(
          (item: TodoItemType) => item.isCompleted && item.id !== todoItem.id
        );

        if (latestCompletedListItemIndex < 0) {
          move(itemIndex, todoSection.list.length - 1);
          return;
        }

        move(itemIndex, latestCompletedListItemIndex - 1);
        onSubmit();
      }, 500);
    },
    [
      itemIndex,
      sectionIndex,
      isActiveFieldArray,
      setValue,
      getValues,
      move,
      onSubmit,
      setSnackbar,
    ]
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

      const cursorLocation = (() => {
        if (shouldFocusAtEnd) {
          return inputRef.current.value.length;
        }
        if (shouldFocusAtStartOrMiddle) {
          return focusedTextInputField.selectionStart;
        }
        return eventCursorLocation;
      })();

      inputRef.current.setSelectionRange(
        cursorLocation,
        cursorLocation,
        "forward"
      );

      onSetSectionActive(fieldName);
    },
    [fieldName, focusedTextInputField, onSetSectionActive]
  );

  const handleBlur = useCallback(() => {
    setFocusedTextInputField(defaultFocusedTextInputField);
  }, [setFocusedTextInputField]);

  return (
    <div className={styles.listItem}>
      <div className={styles.itemContainer}>
        <Controller
          control={control}
          name={checkBoxFieldName}
          render={({ field: { value, onChange } }) => {
            return (
              <Checkbox
                disabled={isActiveFieldArray}
                checked={value}
                onChange={(event) => {
                  onChange(event.target.checked);
                  handleChecked(event.target.checked);
                }}
              />
            );
          }}
        />

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
                className={clsx(styles.item, {
                  [styles.completed]: isCompleted,
                })}
                value={value}
                disableUnderline
                multiline
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={onChange}
                onKeyDown={handleKeyDown}
              />
            );
          }}
        />
      </div>

      {!shouldShowHeader && (
        <ReminderIndicator
          isActiveFieldArray={isActiveFieldArray}
          sectionFieldName={sectionFieldName}
        />
      )}
    </div>
  );
};

export default TodoItem;
