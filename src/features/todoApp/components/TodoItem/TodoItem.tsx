import { Checkbox, ListItem, ListItemText } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoItem as TodoItemType } from "@todoApp/types";
import clsx from "clsx";
import { useState } from "react";
import styles from "./todoItem.module.css";

type TodoItemProps = {
  sectionId: string;
  item: TodoItemType;
};

const TodoItem = ({ sectionId, item }: TodoItemProps) => {
  const [isCompleted, setCompleted] = useState(false);
  const removeTodoItem = useTodoStore((state) => state.removeTodoItem);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompleted(event.target.checked);
    if (event.target.checked) {
      setTimeout(() => removeTodoItem(sectionId, item), 500);
    }
  };

  return (
    <ListItem>
      <Checkbox onChange={handleChange} />
      <ListItemText
        className={clsx(styles.item, { [styles.completed]: isCompleted })}
      >
        {item.text}
      </ListItemText>
    </ListItem>
  );
};

export default TodoItem;
