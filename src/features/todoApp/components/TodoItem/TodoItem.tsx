import { Checkbox, Input, ListItem } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  Controller,
  FieldValues,
  UseFieldArrayInsert,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

type TodoItemProps = {
  itemIndex: number;
  insertListItem: UseFieldArrayInsert<
    FieldValues,
    `todoSections.${number}.list`
  >;
  removeListItems: UseFieldArrayRemove;
  sectionIndex: number;
  sectionFieldName: string;
  listFieldName: string;
  onSetSectionActive: () => void;
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
  const { focusedFieldName, sectionFieldArrayName, setFocusedFieldName } =
    useTodoContext();
  const {
    control,
    formState,

    setFocus,
    setValue,
    getValues,
    getFieldState,
  } = useFormContext();

  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleRemoveItem = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.checked) return;
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
        const newTodoSection = {
          id: todoSection.id,
          name: "",
          list: [
            {
              id: uniqueId(),
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
    },
    [
      itemIndex,
      sectionIndex,
      sectionFieldName,
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
    onSetSectionActive();
  }, [setFocusedFieldName, onSetSectionActive, fieldName]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <ListItem>
      <Checkbox onChange={handleRemoveItem} />
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
