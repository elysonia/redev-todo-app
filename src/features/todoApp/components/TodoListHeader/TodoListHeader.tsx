import { Checkbox, Input, ListSubheader } from "@mui/material";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type TodoListHeaderProps = {
  fieldName: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onListChecked: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateSection: (name: string) => void;
};

const TodoListHeader = ({
  fieldName,
  value,
  onChange,
  onListChecked,
  onUpdateSection,
}: TodoListHeaderProps) => {
  const { getFieldState, handleSubmit, formState } = useFormContext();
  const { isDirty } = getFieldState(fieldName, formState);

  useEffect(() => {
    if (isDirty) {
      handleSubmit(() => onUpdateSection(value))();
    }
  }, [value, isDirty, onUpdateSection]);

  return (
    <ListSubheader>
      <Checkbox onChange={onListChecked} />
      <Input value={value} disableUnderline multiline onChange={onChange} />
    </ListSubheader>
  );
};

export default TodoListHeader;
