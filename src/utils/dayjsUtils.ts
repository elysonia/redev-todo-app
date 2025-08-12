import dayjs, { Dayjs } from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(isTomorrow);
dayjs.extend(isToday);

export const dayjsformatter = (date: Dayjs) => {
  const dateObject = dayjs(date);

  const today = dayjs();
  const weekFromToday = today.add(7, "day");
  const twoDaysLater = today.add(2, "day");

  const isSameDay = dateObject.isToday();
  const isWithinAWeek =
    dateObject.isBefore(weekFromToday) && dateObject.isAfter(today);
  const isWithin2Days =
    dateObject.isBefore(twoDaysLater) && dateObject.isAfter(today);

  const formattedFarFutureDate = dateObject.format("lll");
  const formattedSameWeekDate = dateObject.format("dddd, h:mm A");
  const formattedWithin2DaysTime = dateObject.format("h:mm A");

  if (isSameDay) {
    return `${dateObject.fromNow()}, ${formattedWithin2DaysTime}`;
  }

  if (isWithin2Days) {
    const relativeTimeString = dateObject.isTomorrow()
      ? "Tomorrow"
      : dateObject.fromNow();
    return `${relativeTimeString}, ${formattedWithin2DaysTime}`;
  }

  if (isWithinAWeek) {
    return `${formattedSameWeekDate}`;
  }

  return formattedFarFutureDate;
};
