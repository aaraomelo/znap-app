<template>
  <v-data-table-server v-model:items-per-page="filter.itemsPerPage" :headers="headers" :items-length="total"
    :items="items" :loading="loading" item-value="name" @update:options="loadItems">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Produtos</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props">
              Novo Produto
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.name" label="Nome"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.description" label="Descrição"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.price" label="Preço"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.stock_quantity" label="Estoque (UN)"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-autocomplete type="text" label="Categoria" item-title="name" item-value="id"
                      v-model="editedItem.category_id" :items="categories" :loading="false"
                      @input="(e: any) => loadCategories()" @focus="() => loadCategories()">
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :title="item.raw.name"></v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr>
        <template v-for="column in columns" :key="column.key">
          <td>
            <span class="mr-2 cursor-pointer" @click="() => ((column.filter ?? true) && toggleSort(column))">
              {{ column.title }}
            </span>
            <template v-if="column.filter ?? true">
              <v-menu ffset-y :close-on-content-click="false">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props">
                    <v-icon small>
                      mdi-filter
                    </v-icon>
                  </v-btn>
                </template>
                <div style="background-color: white; width: 280px">
                  <v-autocomplete :type="column?.headerProps?.type ?? 'text'" :label="column.title"
                    v-model="keywords[column.key!]" :items="autocomplete?.[column.key!] ?? []"
                    :loading="loadingAutocomplete?.[column.key!] ?? false"
                    @input="(e: any) => autocompleteItems(column.key!, e.target.value)"
                    @focus="() => autocompleteItems(column.key!, keywords[column.key!] ?? '')"></v-autocomplete>
                  <v-btn @click="keywords[column.key!] = ''" small color="primary" class="ml-2 mb-2">Limpar</v-btn>
                </div>
              </v-menu>
            </template>
            <template v-if="isSorted(column)">
              <v-icon :icon="getSortIcon(column)"></v-icon>
            </template>
          </td>
        </template>
      </tr>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon size="small" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table-server>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import productService from '@/services/product.service';
import productCategoriesService from '@/services/product-categories.service';
import { WatchStopHandle } from 'vue';
import { formatCurrency } from '@/utils'
import { computed } from 'vue';
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
    { key: 'actions', sortable: false, filter: false },
  ]
  items = []
  loading = true
  loadingAutocomplete: Record<string, boolean> = {}
  total = 0
  keywords: Record<string, string> = {}
  dialog = false
  dialogDelete = false
  autocomplete: Record<string, string[]> = {}
  filter: FilterDTO = {
    page: 1,
    itemsPerPage: 10,
    sortKey: null,
    sortOrder: null,
  }
  editedIndex = -1
  formTitle = computed(() => this.editedIndex === -1 ? 'Novo Produto' : 'Editar Produto')
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
  editedItem: any = {}

  categoryFilterDTO: FilterDTO = {
    filters: {
      name: ''
    },
    page: 1,
    itemsPerPage: 5,
    sortKey: 'name',
    sortOrder: 'asc',
  };
  categories: Array<{
    id: number;
    name: string;
  }> = []
  loadCategories() {
    productCategoriesService.filterCategories(this.categoryFilterDTO)
      .then((response) => {
        this.categories = response.data.data
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
  editItem(item: any) {
    this.dialog = true
    this.editedIndex = 1
  }
  deleteItem(item: any) {
    console.log(item);
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

  deleteItemConfirm() { }

  close() { 
    this.editedIndex = -1
    this.dialog = false
  }

  closeDelete() { }

  save() {
    console.log(this.editedItem);

  }
}
</script>