export interface Beer {
  id: number;
  brand: string;
  name: string;
  style: string;
  abv: number | null;
  country: string;
  score: number | null;
  notes: string;
  image: string | null;
  thumb: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BeerInput {
  brand: string;
  name: string;
  style: string;
  abv: number | null;
  country: string;
  score: number | null;
  notes: string;
}

export interface BeerComment {
  id: number;
  authorName: string;
  text: string;
  createdAt: string;
  legacy: boolean;
  mine: boolean;
}
