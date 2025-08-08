import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { defaultTodoSection } from "@todoApp/types";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";

type TodoListHeaderProps = {
  isActiveFieldArray: boolean;
  parentFieldName: string;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetSectionActive: () => void;
};

const TodoListHeader = ({
  isActiveFieldArray,
  parentFieldName,
  onListChecked,
  onSetSectionActive,
}: TodoListHeaderProps) => {
  const fieldName = `${parentFieldName}.name`;
  const { focusedFieldName, setFocusedFieldName } = useTodoContext();
  const { control, setFocus } = useFormContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  }, [setFocusedFieldName, fieldName]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <ListSubheader>
      {!isActiveFieldArray && <Checkbox onChange={onListChecked} />}
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
              placeholder={defaultTodoSection.name}
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
