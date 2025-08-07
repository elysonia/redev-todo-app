import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

type TodoListHeaderProps = {
  parentFieldName: string;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetSectionActive: () => void;
};

const TodoListHeader = ({
  parentFieldName,
  onListChecked,
  onSetSectionActive,
}: TodoListHeaderProps) => {
  const fieldName = `${parentFieldName}.name`;
  const { focusedFieldName, onSubmit, setFocusedFieldName } = useTodoContext();
  const { control, getFieldState, formState } = useFormContext();
  const { isDirty } = getFieldState(fieldName, formState);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const debouncedHandleSubmit = useCallback(
    debounce(() => {
      onSubmit();
    }, 2000),
    [onSubmit]
  );

  const handleFocus = useCallback(() => {
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
    <ListSubheader>
      <Checkbox onChange={onListChecked} />
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
              onChange={onChange}
              onFocus={handleFocus}
            />
          );
        }}
      />
    </ListSubheader>
  );
};

export default TodoListHeader;
