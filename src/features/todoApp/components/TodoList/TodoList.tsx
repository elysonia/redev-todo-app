import { List } from "@mui/material";
import {
  TodoItem as TodoItemType,
  TodoList as TodoListType,
} from "@todoApp/types";
import TodoItem from "../TodoItem";

interface TodoListProps {
  sectionName: string;
  list: TodoListType;
}

const TodoList = ({ sectionName, list }: TodoListProps) => {
  return list.map((item: TodoItemType) => (
    <List key={item.id}>
      <TodoItem item={item} />
    </List>
  ));
};

export default TodoList;
