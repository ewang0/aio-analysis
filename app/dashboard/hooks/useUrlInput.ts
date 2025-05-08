import { useState } from "react";

export function useUrlInput(initialUrl: string = "") {
  const [url, setUrl] = useState(initialUrl);
  const [validationError, setValidationError] = useState("");

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (validationError) {
      setValidationError("");
    }
  };

  return {
    url,
    setUrl: handleUrlChange,
    validationError,
    setValidationError,
  };
}
