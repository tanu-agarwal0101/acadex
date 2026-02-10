import { useEffect, useMemo, useState } from "react";
import type { DayLabel, WeekConfigId } from "../lib/types";
import { WEEK_CONFIGS } from "../lib/ui-data";

export default function useScheduleSettings() {
  const [weekConfig, setWeekConfig] = useState<WeekConfigId>("mon-fri");
  const [mobileDay, setMobileDay] = useState<DayLabel>("Mon");

  const visibleDays = useMemo<DayLabel[]>(() => {
    const config = WEEK_CONFIGS.find((item) => item.id === weekConfig);
    const base = config?.days ?? WEEK_CONFIGS[0].days;
    return Array.from(base) as DayLabel[];
  }, [weekConfig]);

  useEffect(() => {
    const storedWeek = localStorage.getItem(
      "weekConfig",
    ) as WeekConfigId | null;
    if (storedWeek && WEEK_CONFIGS.some((item) => item.id === storedWeek)) {
      setWeekConfig(storedWeek);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("weekConfig", weekConfig);
    if (!visibleDays.includes(mobileDay)) {
      setMobileDay(visibleDays[0]);
    }
  }, [weekConfig, mobileDay, visibleDays]);

  return {
    weekConfig,
    setWeekConfig,
    visibleDays,
    mobileDay,
    setMobileDay,
  };
}
