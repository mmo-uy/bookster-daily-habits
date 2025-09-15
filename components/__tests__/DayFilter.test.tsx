import { DAYS } from "@/constants";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { DayFilter } from "../DayFilter";

describe("DayFilter", () => {
  it("renders all day options", () => {
    const { getByText } = render(
      <DayFilter selectedDay="all" onDaySelect={() => {}} />
    );

    expect(getByText("All Days")).toBeTruthy();

    DAYS.forEach((day) => {
      const dayText = day.charAt(0).toUpperCase() + day.slice(1);
      expect(getByText(dayText)).toBeTruthy();
    });
  });

  it("calls onDaySelect when a day is pressed", () => {
    const mockSelect = jest.fn();
    const { getByText } = render(
      <DayFilter selectedDay="all" onDaySelect={mockSelect} />
    );

    const tuesday = getByText("Tuesday");
    fireEvent.press(tuesday);

    expect(mockSelect).toHaveBeenCalledWith("tuesday");
  });

  it("applies active style for selected day", () => {
    const { getByText } = render(
      <DayFilter selectedDay="wednesday" onDaySelect={() => {}} />
    );

    const wednesday = getByText("Wednesday");

    const flattenStyle = StyleSheet.flatten(wednesday.props.style);

    expect(flattenStyle).toEqual(
      expect.objectContaining({ fontWeight: "bold" })
    );
  });
});
