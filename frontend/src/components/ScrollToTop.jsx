import { useScrollTop } from "../hooks/useAnimations";

export default function ScrollToTop() {
  const show = useScrollTop(400);

  return (
    <button
      className={`scroll-top-btn${show ? " show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}