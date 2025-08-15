import { AddCircle, DeleteForever, StopCircle } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import clsx from "clsx";
import { uniqueId } from "lodash";
import { useCallback } from "react";
import {
  FieldValues,
  UseFieldArrayPrepend,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

import AlarmPlayer from "@components/AlarmPlayer";
import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { TodoItem, TodoSection } from "types";
import styles from "./addTodo.module.css";

type AddTodoProps = {
  prependSection: UseFieldArrayPrepend<FieldValues>;
  removeSections: UseFieldArrayRemove;
};

const AddTodo = ({ prependSection, removeSections }: AddTodoProps) => {
  const {
    onSubmit,
    setSnackbar,
    setFocusedFieldName,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { getValues, setValue } = useFormContext();
  const { isPlaying, onStopAudio } = useAudioPlayerContext();

  /* TODO: Form validation */
  const handleAddTodoSection = useCallback(() => {
    const todoItem: TodoItem = {
      id: uniqueId(),
      isCompleted: false,
      text: "",
    };

    const todoSection: TodoSection = {
      id: uniqueId(),
      name: "",
      isCompleted: false,
      isReminderExpired: false,
      reminderDateTime: null,
      list: [todoItem],
    };

    /* Add section at the start of list and focus on the first item immediatelly. */
    const todoSections = getValues("todoSections");
    const nextTodoItemFieldName = `todoSections.0.list.0.text`;
    setFocusedFieldName(nextTodoItemFieldName);
    setSectionFieldArrayName(`todoSections.0`);
    if (todoSections.length === 0) {
      setValue("todoSections", [todoSection]);
    } else {
      prependSection(todoSection);
    }
  }, [
    setFocusedFieldName,
    prependSection,
    getValues,
    setValue,
    setSectionFieldArrayName,
  ]);

  const handleReset = useCallback(() => {
    const isResetConfirmed = confirm(
      "This will remove all tasks. Are you sure?"
    );

    if (isResetConfirmed) {
      removeSections();
      onSubmit();
      setSnackbar({ open: true, message: `Tasks reset` });
    } else {
      setSnackbar({ open: true, message: `Tasks not reset` });
    }
  }, [onSubmit, removeSections, setSnackbar]);

  return (
    <div className={styles.actionButtonContainer}>
      <Tooltip describeChild title="Add new task">
        <Button className={styles.actionButton} onClick={handleAddTodoSection}>
          <AddCircle fontSize="large" />
          <span>Add task</span>
        </Button>
      </Tooltip>

      <Tooltip describeChild title="Reset all tasks">
        <Button className={styles.actionButton} onClick={handleReset}>
          <DeleteForever fontSize="large" />
          <span>Reset tasks</span>
        </Button>
      </Tooltip>

      <AlarmPlayer />

      <Tooltip title={isPlaying ? "Silence alarm" : "No alarm playing"}>
        <Button
          className={clsx(styles.actionButton, {
            [styles.disabled]: !isPlaying,
          })}
          disabled={!isPlaying}
          onClick={onStopAudio}
        >
          <StopCircle fontSize="large" />
          <span>Silence alarm</span>
        </Button>
      </Tooltip>
    </div>
  );
};

export default AddTodo;
