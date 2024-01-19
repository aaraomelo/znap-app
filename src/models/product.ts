export type FilterProductsDTO = {
  filters: {
    name?: string;
    description?: string;
    category?: {
      name?: string;
      description?: string;
    };
  };
  page?: number;
  itemsPerPage?: number;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
};
