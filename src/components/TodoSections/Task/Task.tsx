import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import TodoList from "@components/TodoList";

type TaskProps = {
  index: number;
  field: Record<"id", string>;
};

const Task = React.memo(({ index, field }: TaskProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      key={`${field.id}.${index}`}
      name={`todoSections.${index}`}
      control={control}
      render={({ field: { ref: refCallback, name } }) => {
        return (
          <div
            key={field.id}
            style={{
              padding: "0 30px 30px",
            }}
          >
            <TodoList
              key={field.id}
              refCallback={refCallback}
              sectionIndex={index}
              sectionFieldName={name}
            />
          </div>
        );
      }}
    />
  );
});

export default Task;
