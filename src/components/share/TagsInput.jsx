import { useState } from "react";
import "./TagsInput.css";

export default function TagsInput({ tags, setTags }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      // Remove last tag if backspace on empty input
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const tag = input.trim().toLowerCase();

    if (!tag) return;

    if (tags.length >= 10) {
      alert("Maximum 10 tags allowed");
      return;
    }

    if (tag.length > 30) {
      alert("Tag too long (max 30 characters)");
      return;
    }

    if (tags.includes(tag)) {
      alert("Tag already added");
      return;
    }

    setTags([...tags, tag]);
    setInput("");
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="tags-input-container">
      <div className="tags-input">
        {tags.map((tag, index) => (
          <span key={index} className="tag-chip">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          disabled={tags.length >= 10}
        />
      </div>
    </div>
  );
}
