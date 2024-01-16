<template>
  <v-app>
    <v-main>
      <NavigationDrawer/>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import NavigationDrawer from '@/components/NavigationDrawer.vue';

@Options({
  components: {
    NavigationDrawer,
  },
})
export default class App extends Vue {
}
</script>
