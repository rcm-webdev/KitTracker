export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | null;
  banned: boolean | null;
  createdAt: string;
  binCount: number;
  itemCount: number;
}

export interface Bin {
  id: string;
  userId: string;
  name: string;
  location: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items?: Item[];
}

export interface Item {
  id: string;
  binId: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface SearchResult {
  item: Item;
  binName: string;
  binLocation: string;
  binId: string;
}

export interface ApiError {
  error: string;
}
