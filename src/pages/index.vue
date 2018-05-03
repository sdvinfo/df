<template>
  <q-page padding class="">
    <!-- <div>TRANSLATE EN: {{$t('failed')}}</div> -->
    <q-field
      icon="folder"
      label="Folder to search files"
      :label-width="3"
      helper="Select folder to find files"
    >
      <q-input
        v-model="path"
        type="text"
        :after="[{
          icon: 'more_horiz',
          handler () {
            selectFolderClick()
          }
        }]"
      />
      <input ref="selectedFolderInput"
        type="file"
        webkitdirectory
        style="visibility: hidden; position: absolute;"
        @change="onFolderSelect($event.target.name, $event.target.files); fileCount = $event.target.files.length"
        name="selectedFolderName"
      >
    </q-field>

    <q-field
      class="q-my-xl"
      icon="folder"
      label="Exclude file's masks"
      :label-width="3"
      helper="Select file's masks to exlude from search"
    >
      <q-input
        class="exclude-files"
        v-model="exclude"
        type="textarea"
        rows="5"
        :max-height="120"
      />
    </q-field>
    <q-btn
      label="Find duplicates"
      class="full-width"
      size="md"
      @click="findFiles()"
      color="secondary"
    >
    </q-btn>
  </q-page>
</template>

<script>
// const fs = require('fs')
// const duplicates = require('../lib/duplicates')
import duplicates from '../lib/duplicates'

export default {
  name: 'PageIndex',
  data () {
    return {
      path: '',
      exclude: `node_modules\nbower_components\n.git`,
      duplicates: null
    }
  },

  computed: {
    excludeDirs() {
      let excludeArray = this.exclude.length > 0 ? this.exclude.split('\n') : []
      return excludeArray
    }
  },

  methods: {
    selectFolderClick() {
      let ref = this.$refs.selectedFolderInput
      ref.value = null;
      ref.click();
    },

    onFolderSelect(fieldName, fileList) {
      this.path = fileList[0].path
    },

    findFiles() {
      // console.log('find files... ', this.$electron.remote.app.getName())
      this.$store.dispatch('common/setLastFolder', this.path)
      duplicates.find(this.path, this.excludeDirs, (data) => {
        console.log(data)
        this.duplicates = data
        this.$store.dispatch('common/setDuplicates', data)
        this.$router.push('/results')
      })
    }
  },

  mounted () {
    let lf = localStorage.getItem('lastFolder')
    if (lf) {
      this.path = JSON.parse(lf)
    }
  }
}
</script>

<style lang="stylus">
  @import '~variables'
  .exclude-files
    textarea
      color #2c5c80
      font-weight bold
      font-style italic
</style>
