import { environment } from "@/environment";
import axios, { AxiosError, AxiosResponse } from "axios";
import { buildQueryString } from "@/utils";

export default {
  url: `${environment.api}/product-categories`,

  filterCategories({
    filters,
    ...filterCategories
  }: FilterDTO): Promise<any | string> {
    const filtersQueryString = buildQueryString(filters);
    const queryString = buildQueryString(filterCategories);
    return new Promise((resolve, reject) => {
      axios.get(`${this.url}?${filtersQueryString}&${queryString}`).then(resolve).catch(reject);
    });
  },
};
