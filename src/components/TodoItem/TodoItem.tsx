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
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;

  const handleBackspaceKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isCursorAtStart = inputRef?.current?.selectionStart === 0;
      if (!isCursorAtStart) return;

      event.preventDefault();
      const currentSection = getValues(sectionFieldName);

      const isFirstItem = itemIndex === 0;
      const hasNoSubtasks = currentSection.list.length === 1;
      const isTextEmpty = inputRef.current?.textLength === 0;

      const shouldCreateSingularTaskWithTitle =
        isFirstItem && hasNoSubtasks && !!currentSection.name;

      if (shouldCreateSingularTaskWithTitle) {
        const todoSections = getValues("todoSections");
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
        setFocusedTextInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: currentSection.name.length,
        });
        setValue("todoSections", newTodoSections);
        return;
      }

      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isFinalItemEmpty = isTextEmpty && isFirstItem && !hasNoSubtasks;
      const isLaterItemEmpty = isTextEmpty && !isFirstItem;
      const shouldRemoveItem = isFinalItemEmpty || isLaterItemEmpty;
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
      listFieldName,
      sectionFieldName,
      remove,
      setValue,
      getValues,
      setFocusedTextInputField,
    ]
  );

  const handleEnterKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      /* Prevent key press from adding an extra newline. */
      event.preventDefault();
      const nextItemIndex = itemIndex + 1;
      const selectionStart = inputRef?.current?.selectionStart;
      const newCurrentItemText = inputRef.current?.value?.slice(
        0,
        selectionStart
      );
      const nextItemText = inputRef.current?.value?.slice(selectionStart);
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
      getValues,
      setFocusedTextInputField,
    ]
  );

  const handleArrowKey = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const currentSection = getValues(sectionFieldName);

      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < currentSection.list.length;

      const selectionStart = !isNull(inputRef?.current)
        ? inputRef.current.selectionStart
        : null;

      const shouldFocusOnPrevItem =
        event.key === "ArrowUp" && selectionStart === 0 && isPrevItemIndexValid;

      const shouldFocusOnHeaderName =
        event.key === "ArrowUp" &&
        selectionStart === 0 &&
        !isPrevItemIndexValid;

      const shouldFocusOnNextItem =
        event.key === "ArrowDown" &&
        selectionStart === inputRef?.current?.textLength &&
        isNextItemIndexValid;

      /* Only prevent default cursor behavior when they need to move focus to another field */
      if (
        shouldFocusOnPrevItem ||
        shouldFocusOnHeaderName ||
        shouldFocusOnNextItem
      ) {
        event.preventDefault();
      }

      const nextFocusedFieldName = (
        shouldFocusOnPrevItem
          ? `${listFieldName}.${prevItemIndex}.text`
          : shouldFocusOnHeaderName
          ? `${sectionFieldName}.name`
          : shouldFocusOnNextItem
          ? `${listFieldName}.${nextItemIndex}.text`
          : ""
      ) as TextInputFieldName;

      const nextSelectionStart =
        shouldFocusOnPrevItem || shouldFocusOnHeaderName
          ? 0
          : shouldFocusOnNextItem
          ? -1
          : null;

      /* Prevent calling setFocusedTextInputField when the focus should not change. */
      if (isEmpty(nextFocusedFieldName) && isEmpty(nextSelectionStart)) return;

      setFocusedTextInputField({
        fieldName: nextFocusedFieldName,
        selectionStart: nextSelectionStart,
      });
    },
    [
      fieldName,
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
