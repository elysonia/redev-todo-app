import { Checkbox, Input } from "@mui/material";
import clsx from "clsx";
import { uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
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
    focusedFieldName,
    sectionFieldArrayName,
    setFocusedFieldName,
    onSubmit,
    setSnackbar,
  } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const { move, insert, remove } = listFieldArrayMethods;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const section = getValues(sectionFieldName);

      const isPrevItemIndexValid = prevItemIndex >= 0;
      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < section.list.length;
      const isTextEmpty = inputRef.current?.textLength === 0;

      const shouldAddNewItem = event.key === "Enter";

      if (shouldAddNewItem) {
        /* Prevent key press from adding an extra newline. */
        event.preventDefault();

        insert(nextItemIndex, {
          id: uniqueId(),
          isCompleted: false,
          text: "",
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

      /* If the item should be removed, focus on either the previous or the next first item on the list. */
      const shouldRemoveItem =
        event.key === "Backspace" &&
        isTextEmpty &&
        (section.list.length > 1 ||
          (section.list.length === 1 && !!section.name));

      if (shouldRemoveItem) {
        const nextFocusedFieldName = isPrevItemIndexValid
          ? `${listFieldName}.${prevItemIndex}.text`
          : `${listFieldName}.0.text`;

        setFocus(nextFocusedFieldName);
        remove(itemIndex);
      }

      /*
        If the the user tries to remove the final item on the list, create a new subtask 
        from the section name or do nothing if there is no section name.
      */
      const shouldCreateSingleTaskFromSectionName =
        event.key === "Backspace" &&
        isTextEmpty &&
        !isPrevItemIndexValid &&
        !isNextItemIndexValid &&
        !!section.name;

      if (shouldCreateSingleTaskFromSectionName) {
        const newTodoSections = getValues("todoSections").map(
          (section: TodoSection, index: number) => {
            if (sectionFieldName === `todoSections.${index}`) {
              const newTodoItem = {
                ...getDefaultTodoItem(),
                text: section.name,
              };

              return { ...section, name: "", list: [newTodoItem] };
            }
            return section;
          }
        );

        const nextFieldName = `${listFieldName}.0.text`;
        setFocus(nextFieldName);
        setValue("todoSections", newTodoSections);
      }
    },
    [
      itemIndex,
      setFocus,
      setValue,
      remove,
      insert,
      listFieldName,
      getValues,
      sectionFieldName,
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
  }, [setFocusedFieldName, onSetSectionActive, fieldName]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName, setFocus, fieldName]);

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
