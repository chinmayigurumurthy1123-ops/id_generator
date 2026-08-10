function getBuilderClass(stacks) {
  const normalizedStacks = stacks.map((stack) =>
    stack.toLowerCase().trim()
  );

  // AI / ML gets highest priority
  if (
    normalizedStacks.includes("ai/ml") ||
    normalizedStacks.includes("python") &&
    normalizedStacks.includes("ai/ml")
  ) {
    return "The Model Whisperer";
  }

  // Full-stack combination
  if (
    normalizedStacks.includes("java") &&
    normalizedStacks.includes("react")
  ) {
    return "The Code Alchemist";
  }

  if (
    normalizedStacks.includes("react") &&
    normalizedStacks.includes("node.js")
  ) {
    return "The Full-Stack Architect";
  }

  // Frontend
  if (normalizedStacks.includes("react")) {
    return "The Pixel Architect";
  }

  // Backend
  if (
    normalizedStacks.includes("node.js") ||
    normalizedStacks.includes("java")
  ) {
    return "The API Architect";
  }

  // Cloud
  if (normalizedStacks.includes("aws")) {
    return "The Cloud Architect";
  }

  // Database
  if (normalizedStacks.includes("mongodb")) {
    return "The Data Architect";
  }

  // C++
  if (normalizedStacks.includes("c++")) {
    return "The Systems Hacker";
  }

  // Flutter
  if (normalizedStacks.includes("flutter")) {
    return "The App Alchemist";
  }

  // Python
  if (normalizedStacks.includes("python")) {
    return "The Python Sage";
  }

  // Fallback for custom combinations
  if (normalizedStacks.length > 0) {
    return "The Code Explorer";
  }

  return "The Code Explorer";
}

export default getBuilderClass;