import TodoProvider from "@todoApp/providers/TodoProvider";
import TodoSections from "../TodoSections";

const TodoPage = () => {
  return (
    <TodoProvider>
      <TodoSections />
    </TodoProvider>
  );
};

export default TodoPage;
