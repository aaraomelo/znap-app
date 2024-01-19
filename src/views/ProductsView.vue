<template>
  <v-data-table-server v-model:items-per-page="filter.itemsPerPage" :headers="headers" :items-length="total"
    :items="items" :loading="loading" item-value="name" @update:options="loadItems">

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
                <v-autocomplete :filter="() => 2" :type="column?.headerProps?.type ?? 'text'" :label="column.title"
                  v-model="keywords[column.key!]" :items="autocomplete?.[column.key!] ?? []"
                  :loading="loadingAutocomplete?.[column.key!] ?? false"
                  @input="(e: any) => autocompleteItems(column.key!, e.target.value)"
                  @focus="() => autocompleteItems(column.key!, keywords[column.key!] ?? '')"></v-autocomplete>
                <v-btn @click="keywords[column.key!] = ''" small color="primary" class="ml-2 mb-2">Limpar</v-btn>
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
import { WatchStopHandle } from 'vue';
import { formatCurrency } from '@/utils'
@Options({})
export default class ProductsView extends Vue {
  headers: any = [
    { title: 'Nome', key: 'name' },
    { title: 'Descrição', key: 'description' },
    {
      title: 'Preço (R$)',
      key: 'price',
      value: (item: any) => formatCurrency(item.price),
      headerProps: { type: 'number' }
    },
    { title: 'Estoque (UN)', key: 'stock_quantity', headerProps: { type: 'number' } },
    { title: 'Categoria', key: 'category.name' },
  ]
  items = []
  loading = true
  loadingAutocomplete: Record<string, boolean> = {}
  total = 0
  keywords: Record<string, string> = {}

  autocomplete: Record<string, string[]> = {}
  filter: FilterDTO = {
    page: 1,
    itemsPerPage: 10,
    sortKey: null,
    sortOrder: null,
  }

  loadItems({
    page,
    itemsPerPage,
    sortBy
  }: any = {
      page: this.filter.page,
      itemsPerPage: this.filter.itemsPerPage,
      sortBy: [{
        key: this.filter.sortKey,
        order: this.filter.sortOrder,
      }]
    }) {
    this.loading = true
    this.filter.page = page
    this.filter.itemsPerPage = itemsPerPage
    this.filter.sortKey = sortBy?.[0]?.key
    this.filter.sortOrder = sortBy?.[0]?.order

    const filterDTO: FilterDTO = {
      filters: this.keywords,
      page: this.filter.page,
      itemsPerPage: this.filter.itemsPerPage,
      sortKey: this.filter.sortKey,
      sortOrder: this.filter.sortOrder,
    };
    productService.filterProducts(filterDTO)
      .then((response) => {
        const { data: items, total } = response.data
        this.items = items
        this.total = total
      })
      .finally(() => {
        this.loading = false
      })
  }

  private filterDebounceTimer: number | null = null;
  private stopFilterWatcher: WatchStopHandle | null = null;
  private autocompleteDebounceTimer: number | null = null;

  autocompleteItems(key: string, value: string) {
    const handlerAutocomplete = () => {
      this.loadingAutocomplete[key] = true
      this.keywords[key] = value
      productService.autocompleteProducts({ [key]: value })
        .then((response) => {
          this.autocomplete[key] = response.data.data
        })
        .finally(() => {
          this.loadingAutocomplete[key] = false
        })
    }
    if (this.autocompleteDebounceTimer) {
      clearTimeout(this.autocompleteDebounceTimer);
    }
    this.autocompleteDebounceTimer = setTimeout(handlerAutocomplete, 300);
  }

  mounted() {
    this.stopFilterWatcher = this.$watch(
      () => this.filter && this.keywords,
      () => {
        if (this.filterDebounceTimer) {
          clearTimeout(this.filterDebounceTimer);
        }
        this.filterDebounceTimer = setTimeout(this.loadItems, 300);
      },
      { deep: true }
    );

  }
  beforeUnmount() {
    if (this.stopFilterWatcher) {
      this.stopFilterWatcher();
    }
  }
}
</script>
<!-- https://codepen.io/BrunoPanassi/pen/dyNQZQP -->
<!-- https://vuetifyjs.com/en/components/data-tables/basics/#headers-slot -->