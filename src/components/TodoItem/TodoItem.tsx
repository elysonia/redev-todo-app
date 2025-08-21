import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { isNull, uniqueId } from "lodash";
import { FocusEvent, useCallback, useEffect, useRef } from "react";
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
  const fieldName = `${listFieldName}.${itemIndex}.text`;
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;

  const {
    sectionFieldArrayName,
    focusedInputField,
    setFocusedInputField,
    onSubmit,
    setSnackbar,
  } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const { move, insert, remove } = listFieldArrayMethods;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const handleBackspace = useCallback(
    (currentSection: TodoSection) => {
      const isFirstItem = itemIndex === 0;
      const hasNoSubtasks = currentSection.list.length === 1;
      const isTextEmpty = inputRef.current?.textLength === 0;

      const shouldCreateSingularTaskWithTitle =
        isFirstItem && hasNoSubtasks && !!currentSection.name;
      console.log({
        shouldCreateSingularTaskWithTitle,
        isFirstItem,
        hasNoSubtasks,
        currentSection,
      });
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

        const nextFieldName = `${listFieldName}.0.text`;
        setFocusedInputField({
          fieldName: nextFieldName,
          selectionStart: currentSection.name.length,
        });
        setFocus(nextFieldName);
        setValue("todoSections", newTodoSections);
        return;
      }

      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const shouldRemoveItem =
        (isTextEmpty && isFirstItem && !hasNoSubtasks) ||
        (isTextEmpty && !isFirstItem);
      const nextFocusedFieldName = isPrevItemIndexValid
        ? `${listFieldName}.${prevItemIndex}.text`
        : `${listFieldName}.0.text`;

      if (shouldRemoveItem) {
        setFocus(nextFocusedFieldName);
        setFocusedInputField({
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

        setFocusedInputField({
          fieldName: nextFocusedFieldName,
          selectionStart: prevItemLength,
        });
        setValue(`${listFieldName}.${prevItemIndex}.text`, newPrevItemText);
        remove(itemIndex);
      }
    },
    [
      itemIndex,
      setFocus,
      setValue,
      remove,
      listFieldName,
      getValues,
      setFocusedInputField,
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

        setFocusedInputField({
          fieldName,
          selectionStart: nextFocusedFieldNameCursorLocation,
        });
        setValue(fieldName, newText);
        insert(nextItemIndex, {
          id: uniqueId(),
          isCompleted: false,
          text: nextItemText,
        });
      }

      const shouldFocusOnPrevItem =
        event.key === "ArrowUp" && isPrevItemIndexValid;

      if (shouldFocusOnPrevItem) {
        event.preventDefault();
        const prevFieldName = `${listFieldName}.${prevItemIndex}.text`;
        setFocus(prevFieldName);
      }

      const shouldFocusOnNextItem =
        event.key === "ArrowDown" && isNextItemIndexValid;

      if (shouldFocusOnNextItem) {
        event.preventDefault();
        const nextFieldName = `${listFieldName}.${nextItemIndex}.text`;
        setFocus(nextFieldName);
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
      setFocus,
      setValue,
      insert,
      fieldName,
      listFieldName,
      getValues,
      handleBackspace,
      sectionFieldName,
      setFocusedInputField,
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
        focusedInputField.fieldName === fieldName &&
        !isNull(focusedInputField.selectionStart) &&
        focusedInputField.selectionStart >= 0;
      const shouldFocusAtEnd =
        !isNull(focusedInputField.selectionStart) &&
        focusedInputField.selectionStart < 0;

      const cursorLocation = shouldFocusAtEnd
        ? inputRef.current.textLength
        : shouldFocusAtStartOrMiddle
        ? focusedInputField.selectionStart
        : eventCursorLocation;

      inputRef.current.setSelectionRange(
        cursorLocation,
        cursorLocation,
        "forward"
      );

      /* Record the field name so we can re-focus to it upon re-render on save. */
      setFocusedInputField({ fieldName, selectionStart: null });
      onSetSectionActive(fieldName);
    },
    [fieldName, setFocusedInputField, onSetSectionActive]
  );

  useEffect(() => {
    /* Restore focus on field on reload without saving */
    if (focusedInputField.fieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedInputField, setFocus, fieldName]);

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
