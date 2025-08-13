import { AlarmTypeEnum } from "enums/alarmEnum";

export type Alarm = {
  title: string;
  alarmType: AlarmTypeEnum;
  filePath: string;
  src: string;
};
