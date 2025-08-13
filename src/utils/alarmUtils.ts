import { AlarmTypeEnum } from "enums/alarmEnum";

export const alarmMap = {
  [AlarmTypeEnum.dreamscape]: {
    id: AlarmTypeEnum.dreamscape,
    title: "Dreamscape",
    filePath: "src/assets/alarmSounds/lofiAlarm/lo-fi-alarm-clock.mp3",
    src: "https://pixabay.com/sound-effects/dreamscape-alarm-clock-117680/",
  },
  [AlarmTypeEnum.lofi]: {
    id: AlarmTypeEnum.lofi,
    title: "Lo-Fi",
    filePath: "src/assets/alarmSounds/lofiAlarm/lo-fi-alarm-clock.mp3",
    src: "https://pixabay.com/sound-effects/lo-fi-alarm-clock-243766/",
  },
  [AlarmTypeEnum.morningJoy]: {
    id: AlarmTypeEnum.morningJoy,
    title: "Morning Joy",
    filePath: "src/assets/alarmSounds/morningJoy/morning-joy-alarm-clock.mp3",
    src: "https://pixabay.com/sound-effects/morning-joy-alarm-clock-20961/",
  },
  [AlarmTypeEnum.oversimplified]: {
    id: AlarmTypeEnum.oversimplified,
    title: "Oversimplified",
    filePath:
      "src/assets/alarmSounds/oversimplified/oversimplified-alarm-clock.mp3",
    src: "https://pixabay.com/sound-effects/oversimplified-alarm-clock-113180/",
  },
  [AlarmTypeEnum.softPlucks]: {
    id: AlarmTypeEnum.softPlucks,
    title: "Soft Plucks",
    filePath:
      "src/assets/alarmSounds/softPlucks/soft-plucks-alarm-clock-120696.mp3",
    src: "https://pixabay.com/sound-effects/soft-plucks-alarm-clock-120696/",
  },
};
