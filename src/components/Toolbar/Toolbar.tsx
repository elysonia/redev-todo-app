import { AddCircle, DeleteForever, StopCircle } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import clsx from "clsx";
import { useCallback } from "react";
import { UseFieldArrayReturn, useFormContext } from "react-hook-form";

import AlarmPlayer from "@components/AlarmPlayer";
import { useAudioPlayerContext } from "@providers/AudioPlayerProvider/AudioPlayerProvider";
import { useTodoContext } from "@providers/TodoProvider/TodoProvider";
import { getDefaultTodoItem, getDefaultTodoSection } from "@utils/todoUtils";
import { TodoSection } from "types";
import styles from "./toolbar.module.css";

type ToolbarProps = {
  sectionFieldArrayMethods: UseFieldArrayReturn;
};

const ToolbarProps = ({ sectionFieldArrayMethods }: ToolbarProps) => {
  const {
    onSubmit,
    setSnackbar,
    setFocusedInputField,
    setSectionFieldArrayName,
  } = useTodoContext();
  const { getValues, setValue } = useFormContext();
  const { isPlaying, onStopAudio } = useAudioPlayerContext();
  const { prepend, remove } = sectionFieldArrayMethods;

  const handleAddTodoSection = useCallback(() => {
    const todoSection: TodoSection = {
      ...getDefaultTodoSection(),
      list: [getDefaultTodoItem()],
    };

    /* Add section at the start of list and focus on the first item immediately. */
    const todoSections = getValues(`todoSections`);
    const nextTodoItemFieldName = `todoSections.0.list.0.text`;
    setFocusedInputField({
      fieldName: nextTodoItemFieldName,
      selectionStart: -1,
    });
    setSectionFieldArrayName(`todoSections.0`);

    if (todoSections.length === 0) {
      setValue("todoSections", [todoSection]);
    } else {
      prepend(todoSection);
    }
  }, [
    prepend,
    getValues,
    setValue,
    setFocusedInputField,
    setSectionFieldArrayName,
  ]);

  const handleReset = useCallback(() => {
    const isResetConfirmed = confirm(
      "This will remove all tasks. Are you sure?"
    );

    if (isResetConfirmed) {
      remove();
      onSubmit();
      setSnackbar({ open: true, message: `Tasks reset` });
    } else {
      setSnackbar({ open: true, message: `Tasks not reset` });
    }
  }, [onSubmit, remove, setSnackbar]);

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
        <span>
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
        </span>
      </Tooltip>
    </div>
  );
};

export default ToolbarProps;
