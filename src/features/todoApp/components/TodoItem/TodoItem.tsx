import { Checkbox, Input, ListItem } from "@mui/material";
import { useTodoContext } from "@todoApp/providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType } from "@todoApp/types";
import { uniqueId } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  Controller,
  FieldValues,
  useFieldArray,
  UseFieldArrayInsert,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

type TodoItemProps = {
  itemIndex: number;
  insert: UseFieldArrayInsert<FieldValues, `todoSections.${number}.list`>;
  remove: UseFieldArrayRemove;
  sectionIndex: number;
  sectionFieldName: string;
  parentFieldName: string;
  onSetSectionActive: () => void;
};

const TodoItem = ({
  itemIndex,
  parentFieldName,
  sectionFieldName,
  sectionIndex,
  insert,
  remove,
  onSetSectionActive,
}: TodoItemProps) => {
  const fieldName = `${parentFieldName}.${itemIndex}.text`;
  const {
    focusedFieldName,
    sectionFieldArrayName,
    onSubmit,
    setFocusedFieldName,
  } = useTodoContext();
  const { control, setFocus, setValue, getValues } = useFormContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { remove: removeSections } = useFieldArray({
    control,
    name: "todoSections",
  });
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        /* Insert new item to the list. */
        event.preventDefault();
        const nextItemIndex = itemIndex + 1;
        const nextFieldName = `${parentFieldName}.${nextItemIndex}.text`;

        setFocusedFieldName(nextFieldName);
        insert(nextItemIndex, {
          id: uniqueId(),
          text: "",
        });
      } else if (event.key === "ArrowUp") {
        /* Go to previous todo item. */
        event.preventDefault();
        const prevItemIndex = itemIndex - 1;

        if (prevItemIndex >= 0) {
          const prevFieldName = `${parentFieldName}.${prevItemIndex}.text`;
          setFocus(prevFieldName);
        }
      } else if (event.key === "ArrowDown") {
        /* Go to next todo item. */
        event.preventDefault();
        const nextItemIndex = itemIndex + 1;

        if (nextItemIndex >= 0) {
          const nextFieldName = `${parentFieldName}.${nextItemIndex}.text`;
          setFocus(nextFieldName);
        }
      } else if (
        /* Remove item when hitting Backspace but text is already empty. */
        event.key === "Backspace" &&
        inputRef.current?.textLength === 0
      ) {
        event.preventDefault();
        const prevItemIndex = itemIndex - 1;

        if (prevItemIndex >= 0) {
          const prevFieldName = `${parentFieldName}.${prevItemIndex}.text`;

          /* Set the next field to focus on after deleting the current one. */
          setFocusedFieldName(prevFieldName);
          remove(itemIndex);
        }
      }
    },
    [itemIndex, setFocusedFieldName, removeSections, setFocus, insert]
  );

  const handleRemoveItem = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // event.stopPropagation();
      if (event.target.checked) {
        console.log("item remove");
        const todoSections = getValues("todoSections");
        const todoSection = getValues(`todoSections.${sectionIndex}`);
        const todoList = getValues(parentFieldName);
        const todoItem = getValues(`${parentFieldName}.${itemIndex}`);
        const newTodoList = todoList.filter(
          (item: TodoItemType) => item.id !== todoItem.id
        );
        // remove(itemIndex);
        // onSubmit();
        const hasNoSubtask = newTodoList.length === 0;

        // if (!todoSection) {
        //   console.log("no section");
        //   removeSections(sectionIndex);

        //   // setValue(parentFieldName, newTodoList);
        // } else
        if (hasNoSubtask) {
          const todoSectionName = todoSection.name;
          if (todoSectionName) {
            const newTodoSection = {
              id: todoSection.id,
              name: "",
              list: [
                {
                  id: uniqueId(),
                  text: todoSectionName,
                },
              ],
            };
            setValue(sectionFieldArrayName, newTodoSection);
          } else {
            // const newTodoSections = todoSections.filter(
            //   (section: TodoSection) => section.id !== todoSection.id
            // );
            // // setValue("todoSections", newTodoSections);
            removeSections(sectionIndex);
          }
        } else {
          // setValue(parentFieldName, newTodoList);
          remove(itemIndex);
        }
      }
      onSubmit();
    },
    [
      onSubmit,
      itemIndex,
      getValues,
      removeSections,
      setValue,
      sectionIndex,
      sectionFieldName,
    ]
  );

  const handleFocus = useCallback(() => {
    if (!inputRef.current) return;
    const cursorLocation = inputRef.current.textLength;
    inputRef.current.setSelectionRange(
      cursorLocation,
      cursorLocation,
      "forward"
    );

    /* Record the field name so we can re-focus to it upon re-render on save. */
    setFocusedFieldName(fieldName);
    onSetSectionActive();
  }, [setFocusedFieldName, onSetSectionActive, fieldName]);

  useEffect(() => {
    /* Prevent losing focus on re-render due to data updates from saving. */
    if (focusedFieldName === fieldName) {
      setFocus(fieldName);
    }
  }, [focusedFieldName]);

  return (
    <ListItem>
      <Checkbox onChange={handleRemoveItem} />
      {/* TODO: Strikethrough when deleted */}

      <Controller
        control={control}
        name={fieldName}
        render={({ field: { ref: refCallback, value, onChange } }) => {
          return (
            <Input
              inputRef={(ref) => {
                /* Allow using RHF functions that need refs on this component. */
                refCallback(ref);
                /* Access the HTMLElement for more functionality. */
                inputRef.current = ref;
              }}
              value={value}
              disableUnderline
              multiline
              onFocus={handleFocus}
              onChange={onChange}
              onKeyDown={handleKeyDown}
            />
          );
        }}
      />
    </ListItem>
  );
};

export default TodoItem;
