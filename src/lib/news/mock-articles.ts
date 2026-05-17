import type { NewsCategorySlug, NormalizedNewsArticle } from "@/lib/news/types";
import { getNewsCategoryConfig } from "@/lib/news/categories";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const mockCatalog: Record<NewsCategorySlug, NormalizedNewsArticle[]> = {
  "top-stories": [
    {
      id: "mock-top-1",
      title: "Community leaders chart a new civic agenda for the decade ahead",
      description:
        "Town halls across the country are turning into policy labs as residents demand durable investments in housing, schools, and public safety.",
      url: "https://kinpress.example/stories/mock-top-1",
      imageUrl: null,
      source: "KinPress Wire",
      author: "KinPress Desk",
      publishedAt: hoursAgo(2),
      category: "Top Stories",
    },
    {
      id: "mock-top-2",
      title: "Historians and organizers reunite a neighborhood archive",
      description:
        "Volunteers are digitizing photographs, sermons, and union records to preserve a living record of Black civic life.",
      url: "https://kinpress.example/stories/mock-top-2",
      imageUrl: null,
      source: "KinPress Culture",
      author: "Maya Ellis",
      publishedAt: hoursAgo(6),
      category: "Top Stories",
    },
  ],
  culture: [
    {
      id: "mock-culture-1",
      title: "A new wave of filmmakers is rewriting the coming-of-age story",
      description:
        "Independent directors are centering friendship, faith, and family in stories that refuse easy stereotypes.",
      url: "https://kinpress.example/stories/mock-culture-1",
      imageUrl: null,
      source: "KinPress Culture",
      author: "Jordan Hale",
      publishedAt: hoursAgo(4),
      category: "Culture",
    },
  ],
  politics: [
    {
      id: "mock-politics-1",
      title: "Voting rights coalitions regroup after a pivotal legislative session",
      description:
        "Organizers say local turnout data will shape strategy for municipal races this fall.",
      url: "https://kinpress.example/stories/mock-politics-1",
      imageUrl: null,
      source: "KinPress Politics",
      author: "Alicia Boone",
      publishedAt: hoursAgo(3),
      category: "Politics",
    },
  ],
  local: [
    {
      id: "mock-local-1",
      title: "Neighborhood clinics expand hours as summer heat intensifies",
      description:
        "Community health workers are pairing wellness checks with mutual aid distribution.",
      url: "https://kinpress.example/stories/mock-local-1",
      imageUrl: null,
      source: "KinPress Local",
      author: "Devin Morris",
      publishedAt: hoursAgo(5),
      category: "Local",
    },
  ],
  business: [
    {
      id: "mock-business-1",
      title: "Worker-owned co-ops see a surge in new membership",
      description:
        "Entrepreneurs are pooling capital to open grocery cooperatives in food desert corridors.",
      url: "https://kinpress.example/stories/mock-business-1",
      imageUrl: null,
      source: "KinPress Business",
      author: "Renee Porter",
      publishedAt: hoursAgo(7),
      category: "Business",
    },
  ],
  arts: [
    {
      id: "mock-arts-1",
      title: "A portrait series honors elders who built the city’s music scene",
      description:
        "The exhibition opens this weekend with live sets from jazz collectives and spoken-word poets.",
      url: "https://kinpress.example/stories/mock-arts-1",
      imageUrl: null,
      source: "KinPress Arts",
      author: "Samira Cole",
      publishedAt: hoursAgo(8),
      category: "Arts",
    },
  ],
  history: [
    {
      id: "mock-history-1",
      title: "Students restore a 1960s boycott timeline for a public library display",
      description:
        "Archivists say the project helps teenagers connect protest history to present-day organizing.",
      url: "https://kinpress.example/stories/mock-history-1",
      imageUrl: null,
      source: "KinPress History",
      author: "Dr. L. Watkins",
      publishedAt: hoursAgo(10),
      category: "History",
    },
  ],
  opinion: [
    {
      id: "mock-opinion-1",
      title: "Opinion: Care work is infrastructure, and it is time we fund it that way",
      description:
        "Policy debates that ignore elder care, childcare, and disability support miss the backbone of every local economy.",
      url: "https://kinpress.example/stories/mock-opinion-1",
      imageUrl: null,
      source: "KinPress Opinion",
      author: "Editorial Board",
      publishedAt: hoursAgo(9),
      category: "Opinion",
    },
  ],
};

export function getMockNewsArticles(category: NewsCategorySlug): NormalizedNewsArticle[] {
  const label = getNewsCategoryConfig(category).label;
  const base = mockCatalog[category] ?? mockCatalog["top-stories"];

  return base.map((article) => ({
    ...article,
    category: label,
  }));
}
