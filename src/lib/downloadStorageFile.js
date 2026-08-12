import { supabase } from "./supabase";

/**
 * Downloads a Storage object without navigating the current browser tab.
 * This keeps the single-page app and its authenticated session intact.
 */
export const downloadStorageFile = async ({ bucket, path, fileName }) => {
  if (!path) {
    throw new Error("No file path provided");
  }

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) throw error;

  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || path.split("/").pop() || "download";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a moment to begin reading the object URL before cleanup.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};
