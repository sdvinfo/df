<template>
  <q-page padding>
    <div class="last-folder__header">
      <div class="row no-wrap">
        <div class="col-7">
          Результаты поиска в папке:
          <br>
          <span class="last-folder__name">{{getLastFolder}}</span>
        </div>
        <div class="col-5 text-right">
          <q-btn
            size="md"
            rounded
            icon="loop"
            color="green-9"
            @click="refreshDuplicates()"
          >
            <q-tooltip>Temporary saving of results</q-tooltip>
          </q-btn>
          <q-btn
            size="md"
            rounded
            icon="save"
            color="blue-9"
            @click="saveDuplicates()"
          >
            <q-tooltip>Temporary saving of results</q-tooltip>
          </q-btn>
          <q-btn
            size="md"
            rounded
            icon="file upload"
            color="teal-9"
            @click="exportFile()"
          >
            <q-tooltip>Export results to JSON-file</q-tooltip>
          </q-btn>
          <q-btn
            size="md"
            rounded
            icon="file download"
            color="teal-9"
            @click="importFile()"
          >
            <q-tooltip>Import results from JSON-file</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="row no-wrap">
      <div class="col-12">
        <q-list highlight striped multiline separator dense v-for="(hash, h) in Object.keys(getDuplicates)" :key="h">
          <q-list-header>
            <span><strong>HASH:</strong> {{hash}}</span>
            <span class="remove-hash-btn">
              <q-btn
                size="sm"
                rounded
                icon="remove circle"
                color="blue-grey-10"
                @click="removeItemFromDuplicates(hash)"
              >
                <q-tooltip>Remove this group from duplicates list</q-tooltip>
              </q-btn>
            </span>
          </q-list-header>
          <q-item-separator />
          <q-item v-for="(file, f) in getDuplicates[hash]" :key="f" style="align-items: center !important;" class="full-height">
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
            <q-item-side right class="row">
              <div class="row no-wrap q-mt-sm">
                <div class="col-auto">
                  <q-btn
                    size="xs"
                    round
                    icon="folder"
                    color="yellow-10"
                    @click="gotoFolder(file.path)"
                  >
                    <q-tooltip>Show file in folder</q-tooltip>
                  </q-btn>

                  <q-btn
                    size="xs"
                    round
                    icon="remove circle"
                    color="red-10"
                    @click="removeFileFromList(hash, f)"
                  >
                    <q-tooltip>Remove file from this list</q-tooltip>
                  </q-btn>

                  <q-btn
                    size="xs"
                    round
                    icon="delete"
                    color="red-8"
                    @click="removeFileFromDisk(hash, f)"
                  >
                    <q-tooltip>Remove file from disk</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-item-side>
          </q-item>
        </q-list>
      </div>
    </div>
    <!-- <pre>{{getDuplicates}}</pre> -->
  </q-page>
</template>

<script>
import {mapGetters} from 'vuex'
import { format, date } from 'quasar'
const { humanStorageSize } = format
import path from 'path'
import fs from 'fs'
export default {
  data() {
    return {
      duplicates: {}
    }
  },

  computed: {
    ...mapGetters('common', ['getDuplicates', 'getLastFolder']),
    getExportFileName() {
      let now = new Date()
      return 'df-' + now.getFullYear() + '.' + now.getMonth() + '.' + now.getDate() + '-' + now.getHours() + now.getMinutes() + now.getSeconds() + '.json'
    }
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
      let duplicates = JSON.parse(JSON.stringify(this.getDuplicates))
      delete duplicates[hash]
      this.$store.dispatch('common/setDuplicates', duplicates)
    },

    removeFileFromList(hash, index) {
      let duplicates = JSON.parse(JSON.stringify(this.getDuplicates))
      duplicates[hash].splice(index, 1)
      this.$store.dispatch('common/setDuplicates', duplicates)
    },

    removeFileFromDisk(hash, f) {
      const filePath = path.resolve(this.getDuplicates[hash][f].path)
      this.$q.dialog({
        title: 'Are you sure you want to delete the file?',
        color: 'primary',
        preventClose: true,
        message: `Selected file for deletion: ${this.getDuplicates[hash][f].stat.name}`,
        ok: {
          color: 'secondary',
          label: 'Delete'
        },
        cancel: {
          color: 'negative',
          label: 'Cancel'
        }
      })
        .then(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              this.$q.notify({position: 'top-right', message: 'Ошибка удаления файла!'})
            }
            this.$q.notify({position: 'top-right', type: 'info', message: 'Файл успешно удален.'})
            this.removeFileFromList(hash, f)
          })
        })
        .catch(() => {
        })
    },

    checkFileExists(file) {
      try {
        fs.accessSync(file.path, fs.constants.F_OK)
        return true
      }
      catch (err) {
        return false
      }
    },

    saveDuplicates() {
      localStorage.setItem('duplicates', JSON.stringify(this.getDuplicates))
    },

    refreshDuplicates() {
      let duplicates = {}
      Object.keys(this.getDuplicates).forEach(hash => {
        duplicates[hash] = this.getDuplicates[hash].filter(x => this.checkFileExists(x))
      })
      this.$store.dispatch('common/setDuplicates', duplicates)
    },

    exportFile() {
      let toLocalPath = path.resolve(this.$electron.remote.app.getPath('downloads'))
      let exportResultsFolder = localStorage.getItem('exportResultsFolder')
      if (exportResultsFolder) {
        toLocalPath = path.resolve(exportResultsFolder)
      }
      let userChosenPath = this.$electron.remote.dialog.showSaveDialog({
        title: 'Save file as',
        defaultPath: toLocalPath + '/' + this.getExportFileName,
        // buttonLabel: 'Export',
        showsTagField: false,
        filters: [
          {name: 'JSON files', extensions: ['json']},
          // {name: 'All Files', extensions: ['*']}
        ]
      })
      if (userChosenPath) {
        // localStorage.setItem('exportResultsFolder', userChosenPath)
        fs.writeFileSync(userChosenPath, JSON.stringify(this.getDuplicates))
      }
    },

    importFile() {
      let toLocalPath = path.resolve(this.$electron.remote.app.getPath('downloads'))
      let exportResultsFolder = localStorage.getItem('exportResultsFolder')
      if (exportResultsFolder) {
        toLocalPath = path.resolve(exportResultsFolder)
      }

      let userChosenPath = this.$electron.remote.dialog.showOpenDialog({
        title: 'Open saved file',
        defaultPath: toLocalPath,
        // buttonLabel: 'Import',
        showsTagField: false,
        filters: [
          {name: 'JSON files', extensions: ['json']},
          // {name: 'All Files', extensions: ['*']}
        ],
        properties: ['openFile']
      })

      if (userChosenPath) {
        console.log('userChosenPath: ', userChosenPath[0])
        // fs.writeFileSync(userChosenPath, JSON.stringify(this.getDuplicates))
        // localStorage.setItem('exportResultsFolder', userChosenPath)
        fs.readFile(userChosenPath[0], 'utf8', (err, data) => {
          if (err) throw err
          console.log(JSON.parse(data))
          this.$store.dispatch('common/setDuplicates', JSON.parse(data))
        });
      }
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
    word-wrap: break-word
    white-space: normal
    word-break: break-word
  // .file-description
  .file-description__block
    font-size .7rem
  .file-description__item
    font-size .7rem
  .remove-hash-btn
    float: right;
    margin-right: 12px

</style>
