import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
  featured?: boolean;
  body: string[];
};

export const categories = [
  { name: "Culture", slug: "culture" },
  { name: "Business", slug: "business" },
  { name: "Wellness", slug: "wellness" },
  { name: "Politics", slug: "politics" },
  { name: "Arts", slug: "arts" }
];

export const articles: Article[] = [
  {
    slug: "building-black-owned-media",
    title: "Building Black-owned media for the next generation",
    excerpt:
      "KinPress centers local reporting, culture writing, and practical guides for Black communities.",
    category: "Culture",
    categorySlug: "culture",
    author: "Maya Johnson",
    publishedAt: "May 12, 2026",
    readTime: "6 min read",
    image: "/article-culture.jpg",
    featured: true,
    body: [
      "Black-owned publications have always done more than report the news. They document possibility, preserve memory, and give communities the context they need to act.",
      "KinPress is built around that lineage with a product experience that makes independent journalism easier to discover, save, and discuss.",
      "The next era of community media needs durable tools, thoughtful curation, and audiences who can move from reading to participation."
    ]
  },
  {
    slug: "neighborhood-small-business-fund",
    title: "A neighborhood fund gives founders room to grow",
    excerpt:
      "Community lenders are pairing capital with mentorship to support early Black-owned businesses.",
    category: "Business",
    categorySlug: "business",
    author: "Andre Clarke",
    publishedAt: "May 9, 2026",
    readTime: "4 min read",
    image: "/article-business.jpg",
    body: [
      "Access to patient capital can decide whether an idea becomes a lasting business.",
      "Local funds are experimenting with lower-friction applications, advisory circles, and flexible repayment structures.",
      "For founders, the biggest shift is confidence: knowing a community institution is invested in the business beyond a single transaction."
    ]
  },
  {
    slug: "rest-as-community-practice",
    title: "Rest as a community practice",
    excerpt:
      "Wellness organizers are reframing rest as shared infrastructure instead of individual escape.",
    category: "Wellness",
    categorySlug: "wellness",
    author: "Simone Bell",
    publishedAt: "May 5, 2026",
    readTime: "5 min read",
    image: "/article-wellness.jpg",
    body: [
      "Rest is often marketed as a private reward, but many organizers are treating it as a public good.",
      "Mutual aid groups, churches, and neighborhood collectives are hosting quiet hours, care exchanges, and low-cost therapy referrals.",
      "The common thread is simple: people recover more fully when support is shared."
    ]
  }
];

export function getFeaturedArticle() {
  return articles.find((article) => article.featured) ?? articles[0];
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(slug: string) {
  return articles.filter((article) => article.categorySlug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}
