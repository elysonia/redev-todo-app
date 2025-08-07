import { Checkbox, Input, ListItem, ListItemText } from "@mui/material";
import { TodoItem as TodoItemType } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

type TodoItemProps = {
  itemIndex: number;
  listFieldArrayName: string;
  fieldArrayName: string;
  itemId: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateItem: (item: TodoItemType) => void;
  onRemoveItem: (id: string) => void;
};

const TodoItem = ({
  itemIndex,
  listFieldArrayName,
  fieldArrayName,
  itemId,
  value,
  onChange,
  onUpdateItem,
  onRemoveItem,
}: TodoItemProps) => {
  const { control, getFieldState, handleSubmit, formState } = useFormContext();
  const { insert } = useFieldArray({
    control,
    name: listFieldArrayName,
  });

  const { isDirty, ...state } = getFieldState(fieldArrayName, formState);

  const handleRemoveItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onRemoveItem(itemId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // Insert new item in the list
      // TODO: Fix new item resetting
      insert(itemIndex++, {
        id: uniqueId(),
        text: "",
      });
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
        <Input
          value={value}
          disableUnderline
          multiline
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />
      </ListItemText>
    </ListItem>
  );
};

export default TodoItem;
