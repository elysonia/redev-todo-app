import { Checkbox, Input, ListItem } from "@mui/material";

import { uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  Controller,
  FieldValues,
  UseFieldArrayInsert,
  UseFieldArrayRemove,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import clsx from "clsx";
import { TodoItem as TodoItemType, TodoSection } from "types";
import styles from "./todoItem.module.css";

type TodoItemProps = {
  itemIndex: number;
  sectionIndex: number;
  sectionFieldName: string;
  listFieldName: string;
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
  insertListItem,
  removeListItems,
  onSetSectionActive,
}: TodoItemProps) => {
  const fieldName = `${listFieldName}.${itemIndex}.text`;
  const checkBoxFieldName = `${listFieldName}.${itemIndex}.isCompleted`;
  const { focusedFieldName, sectionFieldArrayName, setFocusedFieldName } =
    useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  // const [isChecked, setIsChecked] = useState(false);

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
    [itemIndex, setFocus, getValues, removeListItems, insertListItem]
  );

  /* TODO: Modify to push completed tasks to the bottom */
  const handleRemoveItem = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isActiveFieldArray) return;

      event.stopPropagation();
      // setIsChecked(event.target.checked);
      if (!event.target.checked) return;

      setTimeout(() => {
        const todoSections = getValues("todoSections");
        const todoSection = todoSections[sectionIndex];
        const todoItem = todoSection.list[itemIndex];

        const newTodoList = todoSection.list.filter(
          (item: TodoItemType) => item.id !== todoItem.id
        );

        const hasNoSubtask = newTodoList.length === 0;
        const shouldCreateListItemFromSectionName =
          hasNoSubtask && todoSection.name;
        const shouldRemoveSection = hasNoSubtask && !todoSection.name;

        if (shouldCreateListItemFromSectionName) {
          const newTodoSection: TodoSection = {
            id: todoSection.id,
            name: "",
            isCompleted: false,
            isReminderExpired: false,
            list: [
              {
                id: uniqueId(),
                isCompleted: false,
                text: todoSection.name,
              },
            ],
          };
          setValue(sectionFieldArrayName, newTodoSection);
          return;
        }

        if (shouldRemoveSection) {
          const newTodoSections = todoSections.filter(
            (section: TodoSection) => section.id !== todoSection.id
          );
          setValue("todoSections", newTodoSections);
          return;
        }

        removeListItems(itemIndex);
      }, 500);
    },
    [
      itemIndex,
      sectionIndex,
      sectionFieldName,
      isActiveFieldArray,
      setValue,
      getValues,
      removeListItems,
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
  }, [focusedFieldName, setFocus]);

  console.log({ isCompleted });
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
              value={value}
              onChange={(event) => {
                onChange(event.target.checked);
                // setIsChecked(event.target.checked);
                // handleRemoveItem(event);
              }}
            />
          );
        }}
      />

      {/* TODO: Strikethrough when deleted */}

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
