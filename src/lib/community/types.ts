export type CommunityResource = {
  id: string;
  title: string;
  organization: string | null;
  description: string;
  category: string;
  location: string | null;
  region: string;
  eligibility: string | null;
  deadline: string | null;
  cost: string | null;
  format: string | null;
  source_url: string;
  date_verified: string | null;
  tags: string[];
};

export type CommunityOpportunity = {
  id: string;
  title: string;
  organization: string | null;
  description: string;
  category: string;
  deadline: string | null;
  eligibility: string | null;
  amount: string | null;
  location: string | null;
  region: string;
  source_url: string;
  date_verified: string | null;
  tags: string[];
};

export type CommunityEvent = {
  id: string;
  title: string;
  organizer: string | null;
  description: string;
  category: string;
  location: string | null;
  region: string;
  starts_at: string | null;
  ends_at: string | null;
  source_url: string;
  image_url: string | null;
  price: string | null;
  tags: string[];
};
