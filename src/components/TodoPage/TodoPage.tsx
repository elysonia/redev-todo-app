import TodoSections from "@components/TodoSections";
import TodoProvider from "@providers/TodoProvider";

const TodoPage = () => {
  return (
    <TodoProvider>
      <TodoSections />
    </TodoProvider>
  );
};

export default TodoPage;
