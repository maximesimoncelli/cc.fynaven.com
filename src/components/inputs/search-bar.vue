<script setup lang="ts">
import { navigate } from "astro:transitions/client";
import { Search, X } from "@lucide/vue";
import { ref, watch } from "vue";

const searchValue = ref(undefined);
const error = ref(false);

const navigateTo = async () => {
  if (searchValue.value) {
    await navigate(`/tags/${searchValue.value}`);
    searchValue.value = undefined;
  } else {
    error.value = true;
  }
};

watch(error, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      error.value = false;
    }, 2000);
  }
});
</script>

<template>
  <div
    ref="searchBar"
    class="relative mx-auto my-2 box-border flex h-8 w-12/12 items-center rounded-full border-2 bg-olive-300 p-0 md:w-8/12 dark:bg-mist-800"
    :class="{
      'animate-shake border-red-700/20': error,
      'border-transparent': !error,
    }"
  >
    <Search v-if="!error" class="absolute left-4" />
    <X v-else class="absolute left-4 text-red-500" />
    <input
      ref="searchInput"
      v-model="searchValue"
      :placeholder="!error ? 'Search for a tag' : 'Such emptiness...'"
      class="relative w-full rounded-full pl-10 text-olive-700 focus:outline-none dark:text-olive-400"
      type="text"
      @keypress.enter="navigateTo"
    />
    <div
      @click.prevent="navigateTo"
      class="flex h-full cursor-pointer items-center rounded-r-full bg-olive-400 px-4 text-xs text-olive-200 hover:bg-olive-700 hover:text-olive-400 dark:bg-mist-900"
    >
      Find
    </div>
  </div>
</template>

<style lang="css" scoped></style>
