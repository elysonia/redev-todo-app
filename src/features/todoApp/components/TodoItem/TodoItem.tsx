import { Checkbox, Input, ListItem, ListItemText } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoItem as TodoItemType } from "@todoApp/types";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import styles from "./todoItem.module.css";

type TodoItemProps = {
  sectionId: string;
  item: TodoItemType;
};

const TodoItem = ({ sectionId, item }: TodoItemProps) => {
  const [isCompleted, setCompleted] = useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const { removeTodoItem, updateTodoItem } = useTodoStore((state) => state);

  const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompleted(event.target.checked);
    if (event.target.checked) {
      setTimeout(() => removeTodoItem(sectionId, item), 500);
    }
  };

  const handleTextInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInputValue(event.target.value);
  };

  const handleUpdateTodoItem = useCallback(
    (sectionId: string, textInputValue: string) => {
      updateTodoItem(sectionId, { id: item.id, text: textInputValue });
    },
    [sectionId, textInputValue]
  );

  useEffect(() => {
    const debouncedUpdateTodoItem = setTimeout(
      () => handleUpdateTodoItem(sectionId, textInputValue),
      1000
    );
    return () => clearTimeout(debouncedUpdateTodoItem);
  }, [textInputValue]);

  useEffect(() => {
    setTextInputValue(item.text);
  }, [item]);

  return (
    <ListItem>
      <Checkbox onChange={handleChecked} />
      <ListItemText
        className={clsx(styles.item, { [styles.completed]: isCompleted })}
      >
        <Input
          value={textInputValue}
          disableUnderline
          onChange={handleTextInputValue}
        />
      </ListItemText>
    </ListItem>
  );
};

export default TodoItem;
