import { HabitsProvider, useHabits } from "@/context/HabitsContext";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

global.fetch = jest.fn((url, options) => {
  if (options?.method === "POST") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "1",
          name: "Read Book",
          description: undefined,
          dayOfWeek: "monday",
        }),
    });
  }
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
}) as jest.Mock;

describe("HabitsProvider", () => {
  it("toggles a habit", async () => {
    const wrapper = ({ children }: any) => (
      <HabitsProvider>{children}</HabitsProvider>
    );

    const { result } = renderHook(() => useHabits(), { wrapper });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.addHabit("Drink Water");
    });

    const habitId = result.current.state.habits[0].id;
    const today = new Date().toISOString().split("T")[0];

    await act(async () => {
      result.current.toggleHabit(habitId);
    });

    expect(result.current.getCompletedCountForDate(today)).toBe(1);

    await act(async () => {
      result.current.toggleHabit(habitId);
    });

    expect(result.current.getCompletedCountForDate(today)).toBe(0);
  });

  it("adds a new habit", async () => {
    const wrapper = ({ children }: any) => (
      <HabitsProvider>{children}</HabitsProvider>
    );

    const { result } = renderHook(() => useHabits(), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.addHabit("Read Book");
    });

    expect(result.current.state.habits.length).toBe(1);
    expect(result.current.state.habits[0].name).toBe("Read Book");
  });
});
