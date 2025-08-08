import { AddCircle } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem, TodoSection } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useFieldArray, useFormContext } from "react-hook-form";

const AddTodo = () => {
  const { onSubmit, setFocusedFieldName } = useTodoContext();
  const { control } = useFormContext();
  const { prepend } = useFieldArray({ control, name: "todoSections" });

  /* TODO: Form validation */
  const handleAddTodoSection = () => {
    const todoItem: TodoItem = {
      id: uniqueId(),
      text: "",
    };

    const todoSection: TodoSection = {
      id: uniqueId(),
      name: "",
      list: [todoItem],
    };

    /* Add section at the start of list and focus on the first item immediatelluy. */
    const todoItemName = `todoSections.0.list.0.text`;
    prepend(todoSection);
    setFocusedFieldName(todoItemName);
    onSubmit();
  };

  return (
    <IconButton onClick={handleAddTodoSection}>
      <AddCircle fontSize="large" />
    </IconButton>
  );
};

export default AddTodo;
