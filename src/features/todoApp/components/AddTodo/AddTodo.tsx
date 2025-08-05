import { Button, TextField } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { defaultTodoSection, TodoItem, TodoSection } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useState } from "react";

type AddTodoProps = {
  sectionId?: string;
};

const AddTodo = ({ sectionId }: AddTodoProps) => {
  const [inputValue, setInputValue] = useState("");
  const { addTodoItem, addTodoSection, todoSections } = useTodoStore(
    (state) => state
  );

  const buttonName = sectionId ? `Add to list` : "Add to new list";

  /* TODO: Form validation */
  const handleAddTodo = () => {
    const todoItem: TodoItem = {
      id: uniqueId(),
      text: inputValue,
    };

    if (!sectionId) {
      const todoSection: TodoSection = {
        id: uniqueId(),
        name: defaultTodoSection.name,
        list: [todoItem],
      };

      addTodoSection(todoSection);
    } else {
      addTodoItem(sectionId, todoItem);
    }

    setInputValue("");
  };

  return (
    <div>
      <TextField
        variant="standard"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
      />
      <Button onClick={handleAddTodo}>{buttonName}</Button>
    </div>
  );
};

export default AddTodo;
