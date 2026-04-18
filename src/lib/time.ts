export interface TimeState {
  greeting: string;
  gradientFrom: string;
  gradientTo: string;
}

export const getTimeState = (): TimeState => {
  const currentHour = new Date().getHours();

  // Morning: 0 to 11
  if (currentHour >= 0 && currentHour < 12) {
    return {
      greeting: "Good Morning",
      gradientFrom: "from-amber-500/20",
      gradientTo: "to-black",
    };
  }
  // Afternoon: 12 to 17
  else if (currentHour >= 12 && currentHour < 18) {
    return {
      greeting: "Good Afternoon",
      gradientFrom: "from-orange-500/20",
      gradientTo: "to-black",
    };
  }
  // Evening/Night: 18 to 23
  else {
    return {
      greeting: "Good Evening",
      gradientFrom: "from-primary/20", // Default deep pink/purple from global
      gradientTo: "to-black",
    };
  }
};
