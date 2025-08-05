import { List } from "@mui/material";
import {
  TodoItem as TodoItemType,
  TodoList as TodoListType,
} from "@todoApp/types";
import TodoItem from "../TodoItem";

type TodoListProps = {
  sectionId: string;
  list: TodoListType;
};

const TodoList = ({ sectionId, list }: TodoListProps) => {
  return list.map((item: TodoItemType) => (
    <List key={item.id}>
      <TodoItem sectionId={sectionId} item={item} />
    </List>
  ));
};

export default TodoList;
