"use client";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import TodoSections from "@components/TodoSections";
import AudioPlayerProvider from "@providers/AudioPlayerProvider";
import TodoProvider from "@providers/TodoProvider";

const TodoPage = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TodoProvider>
        <AudioPlayerProvider>
          <TodoSections />
        </AudioPlayerProvider>
      </TodoProvider>
    </LocalizationProvider>
  );
};

export default TodoPage;
