import { Checkbox, Input, ListItem, ListItemText } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoItem as TodoItemType } from "@todoApp/types";
import clsx from "clsx";
import { debounce } from "lodash";
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
    /* TODO: Do this with animations. */
    /* Slightly delay deletion on list completion so the UI feedback doesn't feel too sudden. */
    if (event.target.checked) {
      setTimeout(() => removeTodoItem(sectionId, item), 500);
    }
  };

  const debouncedUpdateTodoItem = useCallback(
    debounce((sectionId: string, textInputValue: string) => {
      updateTodoItem(sectionId, { id: item.id, text: textInputValue });
    }, 1000),
    [sectionId, textInputValue]
  );

  useEffect(() => {
    debouncedUpdateTodoItem(sectionId, textInputValue);
  }, [sectionId, textInputValue]);

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
          onChange={(event) => setTextInputValue(event.target.value)}
        />
      </ListItemText>
    </ListItem>
  );
};

export default TodoItem;
