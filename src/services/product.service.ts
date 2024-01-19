import { environment } from "@/environment";
import axios, { AxiosError, AxiosResponse } from "axios";
import { FilterProductsDTO } from "@/models/product";
import { buildQueryString } from "@/utils/product";

export default {
  url: `${environment.api}/products`,

  filterProducts({
    filters,
    ...filterProducts
  }: FilterProductsDTO): Promise<any | string> {
    const filtersQueryString = buildQueryString(filters);
    const queryString = buildQueryString(filterProducts);
    return new Promise((resolve, reject) => {
      axios.get(`${this.url}?${filtersQueryString}&${queryString}`).then(resolve).catch(reject);
    });
  },
};
