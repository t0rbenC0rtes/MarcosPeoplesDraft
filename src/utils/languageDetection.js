import { franc } from "franc";

export const detectLanguage = (text) => {
  if (!text || text.length < 10) {
    return "en"; // Default to English for short texts
  }

  // Map franc language codes to our supported languages
  const langMap = {
    eng: "en",
    fra: "fr",
    spa: "es",
    nld: "nl",
    por: "pt",
  };

  try {
    const detected = franc(text, { minLength: 10 });
    return langMap[detected] || "en";
  } catch (error) {
    console.error("Language detection error:", error);
    return "en";
  }
};
