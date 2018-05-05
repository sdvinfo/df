<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted () {
    let dups = localStorage.getItem('duplicates')
    if (dups) {
      this.$store.dispatch('common/setDuplicates', JSON.parse(dups))
    }
    let lastFolder = localStorage.getItem('lastFolder')
    if (lastFolder) {
      this.$store.dispatch('common/setLastFolder', JSON.parse(lastFolder))
    }
  }
}
</script>

<style>
</style>
