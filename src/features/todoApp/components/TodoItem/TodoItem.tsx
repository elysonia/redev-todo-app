import { Checkbox, Input, ListItem, ListItemText } from "@mui/material";
import { TodoItem as TodoItemType } from "@todoApp/types";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type TodoItemProps = {
  fieldArrayName: string;
  itemId: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateItem: (item: TodoItemType) => void;
  onRemoveItem: (id: string) => void;
};

const TodoItem = ({
  fieldArrayName,
  itemId,
  value,
  onChange,
  onUpdateItem,
  onRemoveItem,
}: TodoItemProps) => {
  const { getFieldState, handleSubmit, resetField, formState } =
    useFormContext();
  const { isDirty } = getFieldState(fieldArrayName, formState);
  const handleRemoveItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onRemoveItem(itemId);
    }
  };
  useEffect(() => {
    if (isDirty) {
      handleSubmit(() =>
        onUpdateItem({
          id: itemId,
          text: value,
        })
      )();
    }
  }, [value, itemId, isDirty, onUpdateItem]);

  return (
    <ListItem>
      <Checkbox onChange={handleRemoveItem} />
      {/* TODO: Strikethrough when deleted */}
      <ListItemText>
        <Input value={value} disableUnderline onChange={onChange} />
      </ListItemText>
    </ListItem>
  );
};

export default TodoItem;
