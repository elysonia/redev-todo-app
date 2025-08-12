import {
  Button,
  ClickAwayListener,
  IconButton,
  List,
  Tooltip,
} from "@mui/material";
import { isEmpty, uniqueId } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { CheckCircle } from "@mui/icons-material";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "types";
import TodoItem from "../TodoItem";
import TodoListHeader from "../TodoListHeader";
import styles from "./todoList.module.css";

type TodoListProps = {
  sectionIndex: number;
  sectionFieldName: string;
};

const TodoList = ({ sectionIndex, sectionFieldName }: TodoListProps) => {
  const fieldName = `todoSections.${sectionIndex}.list`;
  const {
    focusedFieldName,
    sectionFieldArrayName,
    onSubmit,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues, setFocus, setValue } = useFormContext();
  const { fields, insert, remove } = useFieldArray({
    control,
    name: fieldName,
  });

  const isActiveFieldArray = sectionFieldArrayName === sectionFieldName;
  const shouldShowHeader = useMemo(() => {
    const headerFieldName = `${sectionFieldName}.name`;
    const headerFieldValue = getValues(headerFieldName);

    const hasNoHeaderName = isEmpty(headerFieldValue);
    const hasNoSubtasks = fields.length === 1;

    if (hasNoSubtasks && hasNoHeaderName) return false;
    if (!isActiveFieldArray) return true;
    return true;
  }, [sectionFieldName, focusedFieldName, isActiveFieldArray, fields]);

  /* Filter out empty todo item on clicking away from the section. */
  const handleClickAway = useCallback(() => {
    const todoSections = getValues("todoSections");
    const todoSection = todoSections[sectionIndex];
    const todoList = todoSection.list;

    const newTodoList = todoList.filter((item: TodoItemType) => {
      return !isEmpty(item.text);
    });

    const hasNoSubtask = newTodoList.length === 0;
    const shouldCreateListItemFromSectionName =
      hasNoSubtask && todoSection.name;
    const shouldRemoveSection = hasNoSubtask && !todoSection.name;

    if (shouldCreateListItemFromSectionName) {
      const newTodoSection: TodoSection = {
        id: todoSection.id,
        name: "",
        isCompleted: false,
        list: [
          {
            id: uniqueId(),
            isCompleted: false,
            text: todoSection.name,
          },
        ],
      };
      setValue(sectionFieldName, newTodoSection);
    } else if (shouldRemoveSection) {
      const newTodoSections = todoSections.filter(
        (section: TodoSection) => section.id !== todoSection.id
      );
      setValue("todoSections", newTodoSections);
    } else {
      setValue(fieldName, newTodoList);
    }

    setSectionFieldArrayName("");
    setFocusedFieldName("");
    onSubmit();
    setSnackbar({ open: true, message: `Tasks saved` });
  }, [sectionIndex, fieldName, setSnackbar, setSectionFieldArrayName]);

  const handleSetSectionActive = useCallback(
    (nextFocusedFieldName?: string) => {
      if (isActiveFieldArray) return;
      if (focusedFieldName) return;

      if (nextFocusedFieldName) {
        setFocus(nextFocusedFieldName);
      } else {
        const lastItemFieldName = `${fieldName}.${
          getValues(fieldName).length - 1
        }.text`;

        setFocus(lastItemFieldName);
      }

      setSectionFieldArrayName(sectionFieldName);
    },
    [
      isActiveFieldArray,
      sectionFieldName,
      focusedFieldName,
      fieldName,
      setFocus,
      setSectionFieldArrayName,
      getValues,
    ]
  );

  useEffect(() => {
    if (!isActiveFieldArray) return;
    if (focusedFieldName) return;
    const lastItemFieldName = `${fieldName}.${getValues(fieldName).length - 1}`;
    setFocus(lastItemFieldName);
  }, [isActiveFieldArray, focusedFieldName, fieldName, setFocus, getValues]);

  return (
    <ClickAwayListener
      key={sectionIndex}
      mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
      touchEvent={isActiveFieldArray ? "onTouchStart" : false}
      onClickAway={handleClickAway}
    >
      <div className={styles.listContainer}>
        {shouldShowHeader && (
          <TodoListHeader
            isActiveFieldArray={isActiveFieldArray}
            sectionFieldName={sectionFieldName}
            onSetSectionActive={handleSetSectionActive}
          />
        )}

        <List>
          {fields.map((item, itemIndex: number) => (
            <TodoItem
              key={item.id}
              itemIndex={itemIndex}
              insertListItem={insert}
              removeListItems={remove}
              sectionIndex={sectionIndex}
              sectionFieldName={`todoSections.${sectionIndex}`}
              listFieldName={fieldName}
              onSetSectionActive={handleSetSectionActive}
            />
          ))}
        </List>
        {isActiveFieldArray && (
          <div className={styles.listFooterContainer}>
            {/* TODO: Complete alarm function */}
            <Button>Set reminder</Button>
            <Tooltip describeChild title="Done">
              <IconButton
                className={styles.checkCirclIcon}
                onClick={handleClickAway}
              >
                <CheckCircle fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default TodoList;
