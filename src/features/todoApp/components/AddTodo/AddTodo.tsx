import { AddCircle, DeleteForever } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem, TodoSection } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useCallback } from "react";
import {
  FieldValues,
  UseFieldArrayAppend,
  UseFieldArrayInsert,
  UseFieldArrayPrepend,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

type AddTodoProps = {
  prepend: UseFieldArrayPrepend<FieldValues>;
  append: UseFieldArrayAppend<FieldValues>;
  insert: UseFieldArrayInsert<FieldValues, `todoSections`>;
  remove: UseFieldArrayRemove;
};

const AddTodo = ({ prepend, append, insert, remove }: AddTodoProps) => {
  const { sectionFieldArrayName, onSubmit, setFocusedFieldName } =
    useTodoContext();
  const { control, getValues, reset, setValue } = useFormContext();

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

    const todoSections = getValues("todoSections");
    /* Add section at the start of list and focus on the first item immediatelluy. */
    const todoItemName = `todoSections.0.list.0.text`;
    console.log({ "todoSections.0": getValues("todoSections.0"), todoSection });
    setFocusedFieldName(todoItemName);
    if (todoSections.length === 0) {
      reset({ todoSections: [todoSection] });
      onSubmit();
    } else {
      // onSubmit();

      prepend(todoSection);
    }
    // onSubmit();
  }, [onSubmit, setFocusedFieldName, prepend, append, insert, reset]);

  const handleReset = useCallback(() => {
    // reset({ todoSections: [] });
    remove();
    onSubmit();
  }, [onSubmit, remove]);

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
