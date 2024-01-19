  type FilterObject = Record<string, any>;
  type FilterDTO = {
    filters?: Record<string, string>;
    page?: number;
    itemsPerPage?: number;
    sortKey?: string | null;
    sortOrder?: "asc" | "desc" | null;
  };
