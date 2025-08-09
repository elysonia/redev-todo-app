import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { defaultTodoSection, TodoSection } from "@todoApp/types";
import { useCallback, useEffect, useRef } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import styles from "./todoListHeader.module.css";

type TodoListHeaderProps = {
  isActiveFieldArray: boolean;
  parentFieldName: string;
  sectionIndex: number;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetSectionActive: () => void;
};

const TodoListHeader = ({
  isActiveFieldArray,
  parentFieldName,
  sectionIndex,
  onListChecked,
  onSetSectionActive,
}: TodoListHeaderProps) => {
  const fieldName = `${parentFieldName}.name`;
  const { focusedFieldName, setFocusedFieldName, onSubmit } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const { remove, update } = useFieldArray({ control, name: "todoSections" });
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

  const handleRemove = (event: React.ChangeEvent<HTMLInputElement>) => {
    // event.stopPropagation();
    // remove();
    const todoSection = getValues(parentFieldName);
    const todoSections = getValues("todoSections");

    const newTodoSections = todoSections.filter(
      (section: TodoSection) => section.id !== todoSection.id
    );

    setValue("todoSections", newTodoSections);
    console.log({ parentFieldName, newTodoSections });

    // remove(sectionIndex);
    onSubmit();
  };

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <div className={styles.listHeaderContainer}>
      <ListSubheader
      // classes={{ root: styles.listHeaderContainer }}
      >
        {!isActiveFieldArray && <Checkbox onChange={handleRemove} />}
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
    </div>
  );
};

export default TodoListHeader;
