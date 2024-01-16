<template>
    <v-navigation-drawer :class="drawerClass" v-model="drawer">
      <v-list-item :title="appTitle" :subtitle="appSubtitle"></v-list-item>
      <v-divider></v-divider>
      <v-list-item v-for="item in listItems" :key="item.title" :to="item.link" @click="navigateTo(item.link)">
        {{ item.title }}
      </v-list-item>
    </v-navigation-drawer>
  </template>
  
  <script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  
  export default class NavigationDrawer extends Vue {
    drawer = true;
    appTitle = "My Application";
    appSubtitle = "Vuetify";
    listItems = [
      { link: "/produtos", title: "Produtos" },
      { link: "/categorias", title: "Categorias" },
      { link: "/clientes", title: "Clientes" }
    ];
  
    get drawerClass() {
      return "xs12 sm6 md4";
    }
  
    navigateTo(route: string) {
      this.$router.push(route);
    }
  }
  </script>