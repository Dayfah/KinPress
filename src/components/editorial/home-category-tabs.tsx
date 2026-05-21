import Link from "next/link";

const tabs = [
  { label: "Top Stories", href: "/" },
  { label: "For You", href: "/for-you" },
  { label: "Latest", href: "/latest" },
  { label: "Politics", href: "/topic/politics" },
  { label: "Culture", href: "/topic/culture" },
  { label: "Business", href: "/topic/business" },
  { label: "Health", href: "/topic/health" },
  { label: "Tech", href: "/topic/tech" },
  { label: "History", href: "/topic/history" },
  { label: "Local", href: "/topic/local" },
  { label: "Resources", href: "/resources" },
  { label: "Opinion", href: "/topic/opinion" },
];

export function HomeCategoryTabs() {
  return (
    <nav aria-label="KinPress sections" className="kp-pill-scroll -mx-4 px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <li className="shrink-0" key={tab.href}>
            <Link className="kp-home-pill" href={tab.href}>
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
