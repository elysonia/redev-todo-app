import { Button, TextField } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoSections } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useState } from "react";

interface AddTodoProps {
  sectionName?: string;
}

const validateSectionName = (
  sectionName: string,
  todoSections: TodoSections
) => {
  const hasDuplicateName =
    Object.keys(todoSections).findIndex((key) => key === sectionName) >= 0;

  if (hasDuplicateName) {
    return [false, `There is already a todo list called "${sectionName}"`];
  }

  return [true, ""];
};

const AddTodo = ({ sectionName = "" }: AddTodoProps) => {
  const [inputValue, setInputValue] = useState("");
  const { addTodoItem, addTodoSection, todoSections } = useTodoStore(
    (state) => state
  );

  const buttonName = sectionName
    ? `Add to "${sectionName}" list`
    : "Add todo list";
  const handleAddTodo = () => {
    if (!sectionName) {
      const [isInputValid, message] = validateSectionName(
        inputValue,
        todoSections
      );

      if (isInputValid) {
        addTodoSection(inputValue);
      } else {
        alert(message);
      }
    } else {
      const todoItem = {
        id: uniqueId(),
        text: inputValue,
      };
      addTodoItem(sectionName, todoItem);
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
