import { Checkbox, Input, ListItem } from "@mui/material";
import clsx from "clsx";
import { uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  Controller,
  FieldValues,
  UseFieldArrayInsert,
  UseFieldArrayMove,
  UseFieldArrayRemove,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType } from "types";
import styles from "./todoItem.module.css";

type TodoItemProps = {
  itemIndex: number;
  sectionIndex: number;
  sectionFieldName: string;
  listFieldName: string;
  moveListItem: UseFieldArrayMove;
  insertListItem: UseFieldArrayInsert<
    FieldValues,
    `todoSections.${number}.list`
  >;
  removeListItems: UseFieldArrayRemove;
  onSetSectionActive: (nextFocusedFieldName?: string) => void;
};

const TodoItem = ({
  itemIndex,
  sectionIndex,
  listFieldName,
  sectionFieldName,
  moveListItem,
  insertListItem,
  removeListItems,
  onSetSectionActive,
}: TodoItemProps) => {
  const fieldName = `${listFieldName}.${itemIndex}.text`;
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const {
    focusedFieldName,
    sectionFieldArrayName,
    setFocusedFieldName,
    onSubmit,
  } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;
  const isCompleted = useWatch({ control, name: checkBoxFieldName });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const nextItemIndex = itemIndex + 1;
      const prevItemIndex = itemIndex - 1;
      const isPrevItemIndexValid = prevItemIndex >= 0;
      const todoList = getValues(listFieldName);

      const isNextItemIndexValid =
        nextItemIndex >= 0 && nextItemIndex < todoList.length;

      const isTextEmpty = inputRef.current?.textLength === 0;

      const shouldAddNewItem = event.key === "Enter";
      if (shouldAddNewItem) {
        /* Prevent key press from adding an extra newline. */
        event.preventDefault();

        insertListItem(nextItemIndex, {
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

      const shouldRemoveItem = event.key === "Backspace" && isTextEmpty;
      if (shouldRemoveItem) {
        event.preventDefault();
        if (prevItemIndex >= 0) {
          const prevFieldName = `${listFieldName}.${prevItemIndex}.text`;

          /* Set the next field to focus on after removing the current one. */
          setFocus(prevFieldName);

          removeListItems(itemIndex);
        }
      }
    },
    [
      itemIndex,
      setFocus,
      getValues,
      removeListItems,
      listFieldName,
      insertListItem,
    ]
  );

  const handleChecked = useCallback(
    (isChecked: boolean) => {
      if (isActiveFieldArray) return;
      setTimeout(() => {
        if (!isChecked) {
          moveListItem(itemIndex, 0);
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

        const hasNoSubtask = newIncompleteTodoList.length === 0;

        if (hasNoSubtask) {
          setValue(`todoSections.${sectionIndex}`, {
            ...todoSection,
            isCompleted: true,
          });
          return;
        }

        const latestCompletedListItemIndex = todoSection.list.findIndex(
          (item: TodoItemType) => item.isCompleted && item.id !== todoItem.id
        );

        if (latestCompletedListItemIndex < 0) {
          moveListItem(itemIndex, todoSection.list.length - 1);
          return;
        }

        moveListItem(itemIndex, latestCompletedListItemIndex);
        onSubmit();
      }, 500);
    },
    [
      itemIndex,
      sectionIndex,
      isActiveFieldArray,
      setValue,
      getValues,
      moveListItem,
      onSubmit,
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
    <ListItem>
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
    </ListItem>
  );
};

export default TodoItem;
