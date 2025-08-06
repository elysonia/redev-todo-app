import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useTodoStore } from "@todoApp/providers/TodoStoreProvider/TodoStoreProvider";
import { TodoSection } from "@todoApp/types";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

type TodoListHeaderProps = {
  section: TodoSection;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const TodoListHeader = ({ section, onListChecked }: TodoListHeaderProps) => {
  const [name, setName] = useState("");
  const { updateTodoSection } = useTodoStore((state) => state);

  const sectionName = section.name;

  const debouncedUpdateTodoSection = useCallback(
    debounce((name: string) => {
      updateTodoSection({ ...section, name });
    }, 1000),
    [name]
  );

  useEffect(() => {
    debouncedUpdateTodoSection(name);
  }, [name]);

  useEffect(() => {
    setName(sectionName);
  }, [sectionName]);

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
