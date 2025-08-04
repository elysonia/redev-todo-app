import { CheckBox, Delete } from "@mui/icons-material";
import { ListItem, ListItemText } from "@mui/material";
import { TodoItem as TodoItemType } from "@todoApp/types";

interface TodoItemProps {
  item: TodoItemType;
}

const TodoItem = ({ item }: TodoItemProps) => {
  return (
    <ListItem>
      <CheckBox />
      <ListItemText>{item.text}</ListItemText>
      <Delete />
    </ListItem>
  );
};

export default TodoItem;
