import type { NewsCategorySlug } from "@/lib/news/types";

export type NewsCategoryConfig = {
  slug: NewsCategorySlug;
  label: string;
  /** GNews search query (Black-centered editorial focus). */
  query: string;
  /** Optional top-headlines category when slug is top-stories. */
  headlineCategory?: "general" | "nation" | "world" | "business" | "technology" | "entertainment";
};

export const newsCategoryConfigs: NewsCategoryConfig[] = [
  {
    slug: "top-stories",
    label: "Top Stories",
    query: "Black community OR African American news",
    headlineCategory: "general",
  },
  {
    slug: "culture",
    label: "Culture",
    query: "Black culture OR African American culture",
  },
  {
    slug: "politics",
    label: "Politics",
    query: "Black politics OR African American politics",
  },
  {
    slug: "local",
    label: "Local",
    query: "Black community local news United States",
  },
  {
    slug: "business",
    label: "Business",
    query: "Black business OR Black entrepreneurs",
    headlineCategory: "business",
  },
  {
    slug: "arts",
    label: "Arts",
    query: "Black arts OR African American artists",
  },
  {
    slug: "history",
    label: "History",
    query: "Black history OR African American history",
  },
  {
    slug: "opinion",
    label: "Opinion",
    query: "Black opinion editorial OR African American commentary",
  },
];

export function getNewsCategoryConfig(slug: NewsCategorySlug) {
  return newsCategoryConfigs.find((item) => item.slug === slug) ?? newsCategoryConfigs[0];
}

export function parseNewsCategorySlug(value: string | null | undefined): NewsCategorySlug {
  if (value && newsCategoryConfigs.some((item) => item.slug === value)) {
    return value as NewsCategorySlug;
  }

  return "top-stories";
}
