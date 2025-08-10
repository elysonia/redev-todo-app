import { AddCircle, DeleteForever } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem, TodoSection } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useCallback } from "react";
import {
  FieldValues,
  UseFieldArrayPrepend,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

type AddTodoProps = {
  prependSection: UseFieldArrayPrepend<FieldValues>;
  removeSections: UseFieldArrayRemove;
};

const AddTodo = ({ prependSection, removeSections }: AddTodoProps) => {
  const { onSubmit, setFocusedFieldName } = useTodoContext();
  const { getValues, setValue } = useFormContext();

  /* TODO: Form validation */
  const handleAddTodoSection = useCallback(() => {
    const todoItem: TodoItem = {
      id: uniqueId(),
      text: "",
    };

    const todoSection: TodoSection = {
      id: uniqueId(),
      name: "",
      list: [todoItem],
    };

    /* Add section at the start of list and focus on the first item immediatelly. */
    const todoSections = getValues("todoSections");
    const nextTodoItemFieldName = `todoSections.0.list.0.text`;
    setFocusedFieldName(nextTodoItemFieldName);
    if (todoSections.length === 0) {
      setValue("todoSections", [todoSection]);
    } else {
      prependSection(todoSection);
    }
  }, [setFocusedFieldName, prependSection, setValue, onSubmit]);

  const handleReset = useCallback(() => {
    removeSections();
    onSubmit();
  }, [onSubmit, removeSections]);

  return (
    <>
      <IconButton onClick={handleAddTodoSection}>
        <AddCircle fontSize="large" />
      </IconButton>

      <IconButton onClick={handleReset}>
        <DeleteForever fontSize="large" />
      </IconButton>
    </>
  );
};

export default AddTodo;
