import { useEffect, useState } from "react";
import { Toaster } from "sonner";

function getDocumentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Sonner toaster with theme synced to Tailwind's `.dark` class on `<html>`. */
export default function AppToaster() {
  const [theme, setTheme] = useState<"light" | "dark">(getDocumentTheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(getDocumentTheme());
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <Toaster richColors theme={theme} />;
}
