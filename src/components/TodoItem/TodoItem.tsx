import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { isNull, uniqueId } from "lodash";
import { FocusEvent, useCallback, useRef } from "react";
import {
  Controller,
  UseFieldArrayReturn,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ReminderIndicator from "@components/ReminderIndicator";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { getDefaultTodoItem } from "@utils/todoUtils";
import { TodoItem as TodoItemType, TodoSection } from "types";
import { TextInputFieldName } from "types/todo";
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
  const { control, setFocus, setValue, getValues } = useFormContext();
  const { move, insert, remove } = listFieldArrayMethods;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousSelectionStartRef = useRef<number | null>(null);
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;

  const handleBackspace = useCallback(
    (currentSection: TodoSection) => {
      const isFirstItem = itemIndex === 0;
      const hasNoSubtasks = currentSection.list.length === 1;
      const isTextEmpty = inputRef.current?.textLength === 0;

      const shouldCreateSingularTaskWithTitle =
        isFirstItem && hasNoSubtasks && !!currentSection.name;

      if (shouldCreateSingularTaskWithTitle) {
        const newTodoSections = getValues("todoSections").map(
          (section: TodoSection) => {
            if (section.id === currentSection.id) {
              const newTodoItem = {
                ...getDefaultTodoItem(),
                text: section.name + currentSection.list[itemIndex].text,
              };

              return { ...section, name: "", list: [newTodoItem] };
            }
            return section;
          }
        );

        const nextFieldName = `${listFieldName}.0.text` as TextInputFieldName;
        setFocusedTextInputField({
          fieldName: nextFieldName,
          selectionStart: currentSection.name.length,
        });
        setValue("todoSections", newTodoSections);
        return;
      }

      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const shouldRemoveItem =
        (isTextEmpty && isFirstItem && !hasNoSubtasks) ||
        (isTextEmpty && !isFirstItem);
      const nextFocusedFieldName = (
        isPrevItemIndexValid
          ? `${listFieldName}.${prevItemIndex}.text`
          : `${listFieldName}.0.text`
      ) as TextInputFieldName;

      if (shouldRemoveItem) {
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: -1,
        });
        remove(itemIndex);
        return;
      }

      const shouldCombineWithPrevItemText = !isTextEmpty && !isFirstItem;
      if (shouldCombineWithPrevItemText) {
        const newPrevItemText =
          currentSection.list[prevItemIndex].text +
          inputRef?.current?.textContent;
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
      setValue,
      remove,
      listFieldName,
      getValues,
      setFocusedTextInputField,
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const currentSection = getValues(sectionFieldName);

      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < currentSection.list.length;

      const shouldAddNewItem = event.key === "Enter";

      if (shouldAddNewItem) {
        /* Prevent key press from adding an extra newline. */
        event.preventDefault();

        const cursorLocation = inputRef?.current?.selectionStart;
        const nextFocusedFieldNameCursorLocation =
          cursorLocation === inputRef?.current?.textLength ? -1 : 0;
        const newText = inputRef.current?.textContent?.slice(0, cursorLocation);
        const nextItemText =
          inputRef.current?.textContent?.slice(cursorLocation);

        setValue(fieldName, newText);
        insert(nextItemIndex, {
          id: uniqueId(),
          isCompleted: false,
          text: nextItemText,
        });
        const nextItemFieldName =
          `${listFieldName}.${nextItemIndex}.text` as TextInputFieldName;

        setFocusedTextInputField({
          fieldName: nextItemFieldName,
          selectionStart: nextFocusedFieldNameCursorLocation,
        });
      }

      const shouldFocusOnPrevItem =
        event.key === "ArrowUp" &&
        inputRef.current?.selectionStart === 0 &&
        isPrevItemIndexValid;

      if (shouldFocusOnPrevItem) {
        event.preventDefault();
        const prevFieldName =
          `${listFieldName}.${prevItemIndex}.text` as TextInputFieldName;
        const newSelectionStart = !isNull(inputRef.current)
          ? inputRef.current.selectionStart
          : null;
        setFocusedTextInputField({
          fieldName: prevFieldName,
          selectionStart: newSelectionStart,
        });
      }

      const shouldFocusOnNextItem =
        event.key === "ArrowDown" &&
        inputRef.current?.selectionStart === inputRef?.current?.textLength &&
        isNextItemIndexValid;

      if (shouldFocusOnNextItem) {
        event.preventDefault();
        const nextFieldName =
          `${listFieldName}.${nextItemIndex}.text` as TextInputFieldName;

        setFocusedTextInputField({
          fieldName: nextFieldName,
          selectionStart: -1,
        });
      }

      const isCursorAtStart = inputRef?.current?.selectionStart === 0;
      const shouldNotErasePrevCharacter =
        isCursorAtStart && event.key === "Backspace";

      if (shouldNotErasePrevCharacter) {
        event.preventDefault();
        handleBackspace(currentSection);
      }
    },
    [
      itemIndex,
      fieldName,
      listFieldName,
      previousSelectionStartRef,
      setValue,
      insert,
      getValues,
      handleBackspace,
      sectionFieldName,
      setFocusedTextInputField,
    ]
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

      onSetSectionActive(fieldName);
    },
    [fieldName, onSetSectionActive]
  );

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
