<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
      >
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          DF
          <div slot="subtitle">Duplicate Files</div>
        </q-toolbar-title>
        <!-- <div class="df-logo" @click="openURL('https://df.eng.group')"> -->
        <div class="df-logo" @click="openURL('https://eng.group')">
          <img alt="DF logo" class="avatar" src="~assets/df-logo.svg">
        </div>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-list-header>Actions</q-list-header>
        <q-item @click.native="openPage('/find-files')">
          <q-item-side icon="search" />
          <q-item-main label="Search" sublabel="find duplicate files" />
        </q-item>
        <q-item @click.native="openPage('/results')">
          <q-item-side icon="folder" />
          <q-item-main label="Results" sublabel="process founded duplicates" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  methods: {
    openPage(name) {
      this.$router.push(name)
    },
    openURL
  }
}
</script>

<style lang="stylus">
  @import '~variables'
  .df-logo
    cursor pointer
</style>
