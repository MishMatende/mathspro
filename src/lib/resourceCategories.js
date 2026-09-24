export const RESOURCE_CATEGORIES = [
  { value: "books", label: "Books" },
  { value: "question-bank", label: "Question Bank" },
  { value: "notes", label: "Notes" },
];

export function getResourceCategory(value) {
  return RESOURCE_CATEGORIES.find((category) => category.value === value) || RESOURCE_CATEGORIES[0];
}
