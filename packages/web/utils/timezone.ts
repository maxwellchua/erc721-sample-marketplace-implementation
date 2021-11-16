import moment from "moment-timezone";

export const updateTimezone = (date: Date | null, timezone: string) => {
  if (!date) return undefined;
  const [year, month, day, hour, minute] = [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
  moment.tz.setDefault(timezone);
  const x = moment({
    year,
    month,
    day,
    hour,
    minute,
  });
  moment.tz.setDefault();
  const updatedDate = x.toDate();
  return updatedDate;
};
