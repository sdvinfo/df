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
    <div class="row">
      <div class="col-12">
        <div class="text-truncate">
          {{currentFile}}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import {mapGetters} from 'vuex'
// import duplicates from '../lib/duplicates'
const path = require('path')
const hashFile = require('hash-file')
const walk = require('walk')

export default {
  name: 'PageFindFiles',
  data () {
    return {
      path: '',
      exclude: `node_modules\nbower_components\n.git`,
      duplicates: null,
      files: [],
      hashes: [],
      foundDuplicates: [],
      currentFile: ''
    }
  },

  computed: {
    ...mapGetters('common', ['getLastFolder']),
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
      localStorage.setItem('lastFolder', JSON.stringify(this.path))
      this.$store.dispatch('common/setLastFolder', this.path)
      this.find(this.path, this.excludeDirs, (data) => {
        this.duplicates = data
        localStorage.setItem('duplicates', JSON.stringify(data))
        this.$store.dispatch('common/setDuplicates', data)
        this.$router.push('/results')
      })
    },

    async fileHandler(root, fileStat, next) {
      let file = path.normalize(root + path.sep + fileStat.name)
      this.currentFile = file
      let stat = {
        size: fileStat.size,
        ctime: fileStat.ctime,
        atime: fileStat.atime,
        birthtime: fileStat.birthtime,
        name: fileStat.name,
        uid: fileStat.uid,
        gid: fileStat.gid
      }
      // console.log('file: ', file)
      let hash = await hashFile(file)
      // console.log('hash: ', hash)
      if (this.hashes.indexOf(hash) !== -1 && this.foundDuplicates.indexOf(file) === -1) {
        this.foundDuplicates.push(hash)
      }
      // console.log('duplicates: ', JSON.stringify(duplicates))
      this.files.push({
        path: file,
        stat: stat,
        hash: hash
      })
      this.hashes.push(hash)
      // console.log('files: ', JSON.stringify(files))
      // console.log()
      // console.log('hashes: ', JSON.stringify(hashes))
      next()
    },

    getDuplicates(hash) {
      return this.files
        .filter((file) => {
          return file.hash === hash
        })
        .map((file) => {
          return {
            path: file.path,
            stat: file.stat
          }
        })
    },

    endHandler(cb) {
      let temp = {}
      this.foundDuplicates.forEach((file) => {
        temp[file] = this.getDuplicates(file)
      })
      // console.log('files: ', JSON.stringify(files))
      if (typeof cb === 'function') {
        cb(temp)
      }
    },

    find(path, filters, cb) {
      let fl = filters || []
      let options = {
        followLinks: false,
        filters: fl
      }
      this.files = []
      this.hashes = []
      this.foundDuplicates = []
      // walker = walk.walkSync(path, options)
      let walker = walk.walk(path, options)
      walker.on('names', function(root, nodeNamesArray) {
        nodeNamesArray.sort(function(a, b) {
          if (a > b) return 1
          if (a < b) return -1
          return 0
        })
      })
      walker.on('file', this.fileHandler)
      walker.on('end', this.endHandler.bind(this, cb))
      // console.log('all done: ', walker)
    }
  },

  mounted () {
    if (this.getLastFolder) {
      this.path = this.getLastFolder
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
