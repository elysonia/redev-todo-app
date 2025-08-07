import { Checkbox, Input, ListItem, ListItemText } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { debounce, uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

type TodoItemProps = {
  itemIndex: number;
  parentFieldName: string;
  onSetSectionActive: () => void;
};

const TodoItem = ({
  itemIndex,
  parentFieldName,
  onSetSectionActive,
}: TodoItemProps) => {
  const fieldName = `${parentFieldName}.${itemIndex}.text`;
  const {
    focusedFieldName,
    onSubmit,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, formState, getFieldState } = useFormContext();
  const { insert, remove } = useFieldArray({
    control,
    name: parentFieldName,
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isDirty } = getFieldState(fieldName, formState);

  const debouncedHandleSubmit = useCallback(
    debounce(() => {
      onSubmit();
    }, 2000),
    [onSubmit]
  );

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
      }
      // TODO: Backspace key interaction on empty text ("")
    },
    [itemIndex]
  );
  const handleRemoveItem = (isItemCompleted: boolean) => {
    if (isItemCompleted) {
      remove(itemIndex);
      onSubmit();
    }
  };

  const handleFocus = useCallback(() => {
    /* Record the field name so we can re-focus to it upon re-render on save. */
    setFocusedFieldName(fieldName);
    onSetSectionActive();
  }, [setFocusedFieldName, fieldName]);

  useEffect(() => {
    if (isDirty) {
      debouncedHandleSubmit();
    }
  }, [isDirty, debouncedHandleSubmit]);

  useEffect(() => {
    if (!inputRef.current) return;

    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      const cursorLocation = inputRef.current.textLength;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        cursorLocation,
        cursorLocation,
        "forward"
      );
    }
  }, [focusedFieldName]);

  return (
    <ListItem>
      <Checkbox onChange={(event) => handleRemoveItem(event.target.checked)} />
      {/* TODO: Strikethrough when deleted */}
      <Controller
        control={control}
        name={fieldName}
        render={({ field: { value, onChange } }) => {
          return (
            <Input
              inputRef={inputRef}
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
      <ListItemText></ListItemText>
    </ListItem>
  );
};

export default TodoItem;
