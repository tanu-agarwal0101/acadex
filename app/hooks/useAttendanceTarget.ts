import { useEffect, useState } from "react";

export default function useAttendanceTarget(defaultValue = 75) {
  const [attendanceTargetPercent, setAttendanceTargetPercent] =
    useState(defaultValue);

  useEffect(() => {
    const storedTarget = localStorage.getItem("attendanceTargetPercent");
    if (storedTarget) {
      const next = Number(storedTarget);
      if (!Number.isNaN(next)) {
        setAttendanceTargetPercent(next);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "attendanceTargetPercent",
      attendanceTargetPercent.toString(),
    );
  }, [attendanceTargetPercent]);

  return {
    attendanceTargetPercent,
    setAttendanceTargetPercent,
    attendanceTarget: attendanceTargetPercent / 100,
  };
}
