/** 本地日历日 YYYY-MM-DD（避免 toISOString 的 UTC 偏移） */
export const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const makeDateKey = (year: number, monthIndex: number, day: number) =>
  getDateKey(new Date(year, monthIndex, day));

export const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

/** 比较两个本地日历日（忽略时分秒） */
export const startOfLocalDay = (date: Date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
