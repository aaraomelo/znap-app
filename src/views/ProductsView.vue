<template>
  <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items-length="total" :items="products"
    :loading="loading" item-value="name" @update:options="loadItems">

    <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr>
        <template v-for="column in columns" :key="column.key">
          <td>
            <span class="mr-2 cursor-pointer" @click="() => toggleSort(column)">
              {{ column.title }}
            </span>
            <v-menu ffset-y :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">
                  <v-icon small>
                    mdi-filter
                  </v-icon>
                </v-btn>
              </template>
              <div style="background-color: white; width: 280px">
                <v-text-field v-model="dessertName" class="pa-4" type="text" label="Enter the search term"
                  :autofocus="true"></v-text-field>
                <v-btn @click="dessertName = ''" small color="primary" class="ml-2 mb-2">Clean</v-btn>
              </div>
            </v-menu>

            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </td>
        </template>
      </tr>
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import productService from '@/services/product.service';
import { FilterProductsDTO } from '@/models/product';

@Options({})
export default class ProductsView extends Vue {
  itemsPerPage = 10
  headers: any = [
    {
      title: 'Nome',
      align: 'start',
      sortable: false,
      key: 'name',
    },
    { title: 'Descrição', key: 'description', align: 'start' },
    { title: 'Preço', key: 'price', align: 'start' },
    { title: 'Estoque', key: 'stock_quantity', align: 'start' },
    { title: 'Categoria', key: 'category.name', align: 'start' },
  ]
  products = []
  loading = true
  total = 0
  dessertName = ''
  loadItems({ page, itemsPerPage, sortBy }: any) {
    this.loading = true
    const sortKey = sortBy?.[0]?.key
    const sortOrder = sortBy?.[0]?.order
    const filterDTO: FilterProductsDTO = {
      filters: {
        name: '',
        category: {
          name: '',
        },
      },
      page,
      itemsPerPage,
      sortKey,
      sortOrder,
    };
    productService.filterProducts(filterDTO)
      .then((response) => {
        const { data: products, total } = response.data
        this.products = products
        this.total = total
        this.loading = false
      })
  }
}
</script>
<!-- https://codepen.io/BrunoPanassi/pen/dyNQZQP -->
<!-- https://vuetifyjs.com/en/components/data-tables/basics/#headers-slot -->