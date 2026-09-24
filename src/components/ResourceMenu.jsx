import { useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Library } from "lucide-react";
import { getResourceCategory, RESOURCE_CATEGORIES } from "../lib/resourceCategories";

export default function ResourceMenu({ path, onNavigate }) {
  const location = useLocation();
  const active = location.pathname.startsWith(path);
  const category = getResourceCategory(new URLSearchParams(location.search).get("category"));
  const [expanded, setExpanded] = useState(active);
  const id = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition cursor-pointer ${active ? "bg-(--color-primary)/10 text-(--color-primary) font-medium" : "text-gray-600 hover:bg-gray-100"}`}
      >
        <Library size={18} />
        <span>Resources</span>
        <ChevronDown size={16} className={`ml-auto transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <div id={id} hidden={!expanded} className="ml-6 mt-1 space-y-1 border-l border-gray-100 pl-3">
        {RESOURCE_CATEGORIES.map((item) => (
          <Link
            key={item.value}
            to={`${path}?category=${item.value}`}
            onClick={onNavigate}
            aria-current={active && category.value === item.value ? "page" : undefined}
            className={`block rounded-lg px-3 py-2 transition ${active && category.value === item.value ? "bg-(--color-primary)/10 text-(--color-primary) font-medium" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
