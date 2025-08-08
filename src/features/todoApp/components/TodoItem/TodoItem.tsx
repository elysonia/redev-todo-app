import { Checkbox, Input, ListItem } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
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
  insert: UseFieldArrayInsert<FieldValues, `todoSections.${number}.list`>;
  remove: UseFieldArrayRemove;
  parentFieldName: string;
  onSetSectionActive: () => void;
};

const TodoItem = ({
  itemIndex,
  parentFieldName,
  insert,
  remove,
  onSetSectionActive,
}: TodoItemProps) => {
  const fieldName = `${parentFieldName}.${itemIndex}.text`;
  const { focusedFieldName, onSubmit, setFocusedFieldName } = useTodoContext();
  const { control, setFocus } = useFormContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const nextItemIndex = itemIndex + 1;

        const nextFieldName = `${parentFieldName}.${nextItemIndex}.text`;

        setFocusedFieldName(nextFieldName);
        insert(nextItemIndex, {
          id: uniqueId(),
          text: "",
        });
        onSubmit();
      } else if (event.key === "ArrowUp") {
        /* Go to previous todo item. */
        event.preventDefault();

        const prevItemIndex = itemIndex - 1;

        if (prevItemIndex >= 0) {
          const prevFieldName = `${parentFieldName}.${prevItemIndex}.text`;
          setFocus(prevFieldName);
        }
      } else if (event.key === "ArrowDown") {
        /* Go to next todo item. */
        event.preventDefault();

        const nextItemIndex = itemIndex + 1;

        if (nextItemIndex >= 0) {
          const nextFieldName = `${parentFieldName}.${nextItemIndex}.text`;
          setFocus(nextFieldName);
        }
      } else if (
        /* Remove item when hitting Backspace but text is already empty. */
        event.key === "Backspace" &&
        inputRef.current?.textLength === 0
      ) {
        event.preventDefault();

        const prevItemIndex = itemIndex - 1;

        if (prevItemIndex >= 0) {
          const prevFieldName = `${parentFieldName}.${prevItemIndex}.text`;

          /* Set the next field to focus on after deleting the current one. */
          setFocusedFieldName(prevFieldName);
          remove(itemIndex);
          onSubmit();
        }
      }
    },
    [itemIndex, setFocusedFieldName]
  );

  const handleRemoveItem = (isItemCompleted: boolean) => {
    if (isItemCompleted) {
      remove(itemIndex);
      onSubmit();
    }
  };

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
    // onSetSectionActive();
  }, [setFocusedFieldName, fieldName]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <ListItem>
      <Checkbox onChange={(event) => handleRemoveItem(event.target.checked)} />
      {/* TODO: Strikethrough when deleted */}

      <Controller
        control={control}
        name={fieldName}
        render={({ field: { ref: refCallback, value, onChange } }) => {
          return (
            <Input
              inputRef={(ref) => {
                /* TODO: Check if a bad idea particularly on re-render counts.*/
                /* Allow using RHF functions that need refs. */
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
