import { CheckCircle } from "@mui/icons-material";
import { ClickAwayListener, IconButton, List, Tooltip } from "@mui/material";
import clsx from "clsx";
import dayjs from "dayjs";
import { isEmpty, uniqueId } from "lodash";
import { useCallback, useEffect, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

import ButtonFieldDateTimePicker from "@components/ButtonDateTimePicker";
import TodoItem from "@components/TodoItem";
import TodoListHeader from "@components/TodoListHeader";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { TodoItem as TodoItemType, TodoSection } from "types";
import styles from "./todoList.module.css";

type TodoListProps = {
  sectionIndex: number;
  sectionFieldName: `todoSections.${number}`;
};

const TodoList = ({ sectionIndex, sectionFieldName }: TodoListProps) => {
  const fieldName = `todoSections.${sectionIndex}.list`;
  const reminderDateFieldName = `todoSections.${sectionIndex}.reminderDateTime`;
  const {
    focusedInputField,
    sectionFieldArrayName,
    onSubmit,
    setSnackbar,
    setFocusedInputField,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { control, getValues, setFocus, setValue } = useFormContext();
  const listFieldArrayMethods = useFieldArray({
    control,
    name: fieldName,
  });
  const { fields } = listFieldArrayMethods;
  const isReminderExpired = useWatch({
    control,
    name: `${sectionFieldName}.isReminderExpired`,
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
  }, [sectionFieldName, isActiveFieldArray, fields, getValues]);

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
        isReminderExpired: false,
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
    setFocusedInputField({
      fieldName: "",
      selectionStart: null,
    });
    onSubmit();
    setSnackbar({ open: true, message: `Tasks saved` });
  }, [
    sectionIndex,
    fieldName,
    setSnackbar,
    setSectionFieldArrayName,
    getValues,
    setValue,
    onSubmit,
    sectionFieldName,
    setFocusedInputField,
  ]);

  const handleSetSectionActive = useCallback(
    (nextFocusedFieldName?: string) => {
      if (isActiveFieldArray) return;
      if (focusedInputField.fieldName) return;

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
      focusedInputField,
      fieldName,
      setFocus,
      setSectionFieldArrayName,
      getValues,
    ]
  );

  /* If the user sets a new reminder, reset isReminderExpired. */
  const handleReminderChange = useCallback(() => {
    const todoSection = getValues(sectionFieldName);
    const newTodoSection = {
      ...todoSection,
      isReminderExpired: false,
    };
    setValue(sectionFieldName, newTodoSection);
  }, [getValues, setValue, sectionFieldName]);

  useEffect(() => {
    if (!isActiveFieldArray) return;
    if (focusedInputField.fieldName) return;
    const lastItemFieldName = `${fieldName}.${getValues(fieldName).length - 1}`;
    setFocus(lastItemFieldName);
  }, [isActiveFieldArray, focusedInputField, fieldName, setFocus, getValues]);

  return (
    <ClickAwayListener
      key={sectionIndex}
      mouseEvent={isActiveFieldArray ? "onMouseDown" : false}
      touchEvent={isActiveFieldArray ? "onTouchStart" : false}
      onClickAway={handleClickAway}
    >
      <div
        className={clsx(styles.listContainer, {
          [styles.isOverdue]: isReminderExpired,
        })}
      >
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
              sectionIndex={sectionIndex}
              sectionFieldName={`todoSections.${sectionIndex}`}
              listFieldName={fieldName}
              listFieldArrayMethods={listFieldArrayMethods}
              shouldShowHeader={shouldShowHeader}
              onSetSectionActive={handleSetSectionActive}
            />
          ))}
        </List>
        {isActiveFieldArray && (
          <div className={styles.listFooterContainer}>
            <Controller
              control={control}
              name={reminderDateFieldName}
              render={({ field: { value, onChange } }) => {
                return (
                  <ButtonFieldDateTimePicker
                    disablePast
                    value={value ? dayjs(value) : value}
                    sx={{
                      textTransform: "capitalize",
                    }}
                    slotProps={{
                      actionBar: {
                        actions: ["clear", "cancel", "nextOrAccept"],
                      },
                    }}
                    onChange={(event) => {
                      handleReminderChange();
                      onChange(event);
                    }}
                  />
                );
              }}
            />
            <Tooltip describeChild title="Done">
              <IconButton onClick={handleClickAway}>
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
