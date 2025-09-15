import { Habit } from "../types/habits";

// json-server
const API_BASE_URL = "https://bookster-json-server.millstep.site";

export class ApiService {
  static async fetchHabits(): Promise<Habit[]> {
    try {
      const url = `${API_BASE_URL}/habits`;
      console.log(`🔍 API: Fetching from ${url}`);

      const response = await fetch(url);

      console.log(
        `📡 API Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const habits = await response.json();
      console.log(`✅ API: Fetched ${habits.length} habits from server`);
      return habits;
    } catch (error) {
      console.error("❌ API Error fetching habits:", error);
      console.error("🔗 Current API_BASE_URL:", API_BASE_URL);
      return [];
    }
  }

  static async createHabit(habit: Omit<Habit, "id">): Promise<Habit | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habit),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdHabit = await response.json();
      console.log("✅ API: Habit created successfully");
      return createdHabit;
    } catch (error) {
      console.error("❌ API Error creating habit:", error);
      return null;
    }
  }

  static async updateHabit(
    id: string,
    habit: Partial<Habit>
  ): Promise<Habit | null> {
    try {
      const url = `${API_BASE_URL}/habits/${id}`;
      console.log(`🔍 API: Updating habit ${id} at ${url}`);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habit),
      });

      console.log(
        `📡 API Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const updatedHabit = await response.json();
      console.log("✅ API: Habit updated successfully");
      return updatedHabit;
    } catch (error) {
      console.error("❌ API Error updating habit:", error);
      console.error("🔗 Current API_BASE_URL:", API_BASE_URL);
      return null;
    }
  }

  static async deleteHabit(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("✅ API: Habit deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ API Error deleting habit:", error);
      return false;
    }
  }

  static async syncHabits(localHabits: Habit[]): Promise<Habit[]> {
    try {
      const serverHabits = await this.fetchHabits();
      const habitsToCreate = localHabits.filter(
        (localHabit) =>
          !serverHabits.some((serverHabit) => serverHabit.id === localHabit.id)
      );

      for (const habit of habitsToCreate) {
        const { id, ...habitData } = habit;
        await this.createHabit(habitData);
      }

      return await this.fetchHabits();
    } catch (error) {
      console.error("❌ API Error syncing habits:", error);
      return localHabits;
    }
  }
}
