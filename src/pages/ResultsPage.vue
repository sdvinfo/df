<template>
  <q-page padding>
    <div class="last-folder__header">
      Результаты поиска в папке:
      <br>
      <span class="last-folder__name">{{getLastFolder}}</span>
    </div>
    <div class="row no-wrap">
      <div class="col-12">
        <q-list highlight striped multiline separator dense v-for="(hash, h) in Object.keys(duplicates)" :key="h">
          <q-list-header>
            <span><strong>HASH:</strong> {{hash}}</span>
            <span class="remove-hash-btn">
              <q-btn
                size="sm"
                rounded
                icon="remove circle"
                color="blue-grey-10"
                @click="removeItemFromDuplicates(hash)"
              />
            </span>
          </q-list-header>
          <q-item-separator />
          <q-item v-for="(file, f) in duplicates[hash]" :key="f" class="items-center">
            <q-item-side>
              <q-item-tile>
                № {{h + 1}}.{{f + 1}}
              </q-item-tile>
            </q-item-side>
            <q-item-main :sublabel-lines="5">
              <q-item-tile label><strong>File:</strong> {{file.stat.name}}</q-item-tile>
              <q-item-tile sublabel><strong>Path:</strong> {{file.path}}</q-item-tile>
              <q-item-tile class="file-description">
                <div class="file-description__block">
                  <span class="file-description__item"><strong>Size:</strong> {{getFileSize(file.stat.size)}}</span>
                </div>
                <div class="file-description__block">
                  <span class="file-description__item"><strong>Created:</strong> {{formatDate(file.stat.birthtime, 'DD.MM.YYYY - HH:mm:ss')}}</span>
                <!-- </div>
                <div class="file-description__block"> -->
                  <span class="file-description__item"><strong>Updated:</strong> {{formatDate(file.stat.atime)}}</span>
                </div>
              </q-item-tile>
            </q-item-main>
            <q-item-side right class="items-center">
              <div class="row q-mt-xs justify-center items-center">
                <div class="col-auto">
                  <q-btn
                    size="xs"
                    round
                    icon="folder"
                    color="yellow-10"
                    @click="gotoFolder(file.path)"
                  />
                </div>
              </div>
              <div class="row q-mt-sm justify-center items-center">
                <div class="col-auto">
                  <q-btn
                    size="xs"
                    round
                    icon="delete"
                    color="red-10"
                    @click="removeFileFromList(hash, f)"
                  />
                </div>
              </div>
            </q-item-side>
          </q-item>
        </q-list>
      </div>
      <!-- <div class="col-2">
      </div> -->
    </div>
    <pre>{{duplicates}}</pre>
  </q-page>
</template>

<script>
import {mapGetters} from 'vuex'
import { format, date } from 'quasar'
const { humanStorageSize } = format
// import fs from 'fs'
export default {
  data() {
    return {
      duplicates: {}
    }
  },

  computed: {
    ...mapGetters('common', ['getDuplicates', 'getLastFolder'])
  },

  methods: {
    getFileSize(size) {
      return humanStorageSize(size)
    },

    formatDate(fileDate, format) {
      if (!format) {
        format = 'DD.MM.YYYY - HH:mm:ss'
      }
      return date.formatDate(fileDate, format)
    },

    gotoFolder(path) {
      this.$electron.shell.showItemInFolder(path)
    },

    removeItemFromDuplicates(hash) {
      console.log(hash)
      console.log(this.duplicates[hash])
      // let dups = JSON.parse(JSON.stringify(this.duplicates))
      // delete dups.hash
      this.$nextTick(function () {
        this.$set(this.duplicates, hash, undefined)
      })
      // this.duplicates = Object.assign({}, dups)
      // console.log(this.duplicates[hash].findIndex(file))
      console.log(this.duplicates[hash])
    },

    removeFileFromList(hash, index) {
      console.log(hash)
      console.log(this.duplicates[hash][index])
      this.duplicates[hash].splice(index, 1)
      // console.log(this.duplicates[hash].findIndex(file))
    }
  },

  mounted () {
    let dups = localStorage.getItem('duplicates')
    if (Object.keys(this.getDuplicates).length === 0 && dups) {
      this.duplicates = JSON.parse(dups)
    }
    else {
      this.duplicates = this.getDuplicates
    }
  }
}
</script>

<style scoped lang="stylus">
  @import '~variables'
  .q-list
    padding 0
  .q-list-striped > .q-item:nth-child(even)
    background-color #f5f5f5
  .q-list-header
    background-color $blue-grey-6
    color #ffffff
  .q-item-separator-component
    margin 0
  .last-folder__header
    font-size 1.3rem
    font-weight bolder
    padding 0 0 20px 0
  .last-folder__name
    font-size .8rem
    font-style italic
  // .file-description
  .file-description__block
    font-size .7rem
  .file-description__item
    font-size .7rem
  .remove-hash-btn
    float: right;
    margin-right: 12px

</style>
