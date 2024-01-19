import { environment } from "@/environment";
import axios, { AxiosError, AxiosResponse } from "axios";
import { buildQueryString } from "@/utils";

export default {
  url: `${environment.api}/products`,

  filterProducts({
    filters,
    ...filterProducts
  }: FilterDTO): Promise<any | string> {
    const filtersQueryString = buildQueryString(filters);
    const queryString = buildQueryString(filterProducts);
    return new Promise((resolve, reject) => {
      axios.get(`${this.url}?${filtersQueryString}&${queryString}`).then(resolve).catch(reject);
    });
  },

  autocompleteProducts(autocompletes: FilterDTO['filters']): Promise<any | string> {
    const autocompletesQueryString = buildQueryString(autocompletes);
    return new Promise((resolve, reject) => {
      axios.get(`${this.url}/autocomplete?${autocompletesQueryString}`).then(resolve).catch(reject);
    });
  },
};
