import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoSection } from "@todoApp/types";
import { useCallback, useEffect, useState } from "react";
import styles from "./todoListHeader.module.css";

type TodoListHeaderProps = {
  section: TodoSection;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const TodoListHeader = ({ section, onListChecked }: TodoListHeaderProps) => {
  const [name, setName] = useState("");
  const { updateTodoSection } = useTodoStore((state) => state);

  const sectionName = section.name;
  const handleUpdateTodoSection = useCallback(
    (name: string) => {
      updateTodoSection({ ...section, name });
    },
    [name]
  );

  useEffect(() => {
    const debouncedUpdateTodoSection = setTimeout(
      () => handleUpdateTodoSection(name),
      1000
    );

    return () => clearTimeout(debouncedUpdateTodoSection);
  }, [name]);

  useEffect(() => {
    setName(sectionName);
  }, [sectionName]);

  console.log({ styles });
  return (
    <ListSubheader>
      <Checkbox onChange={onListChecked} />
      <Input
        value={name}
        disableUnderline
        onChange={(event) => setName(event.target.value)}
      />
    </ListSubheader>
  );
};

export default TodoListHeader;
