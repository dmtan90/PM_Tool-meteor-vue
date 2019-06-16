<template>
  <div class="task-history">
    <v-dialog :value="active" @input="$emit('update:active')" :fullscreen="$vuetify.breakpoint.xsOnly" max-width="60%">
      <v-toolbar dark color="primary">
        <v-btn icon flat @click="close()" v-shortkey="['esc']" @shortkey="close()">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t('History') }}
        </v-toolbar-title>
      </v-toolbar>       
      <v-card>
        <v-card-text class="content">
          <v-progress-linear indeterminate v-if="loading"></v-progress-linear>

          <v-timeline clipped dense v-if="!loading"> 
            <v-timeline-item 
              v-for="item in history"
              :key="item._id"
              color="indigo"
              :small="$vuetify.breakpoint.xsOnly"
            >
             <span slot="opposite"></span>
              <v-card class="elevation-2">
                <v-card-text>
                  <div>{{ $t(`history.${item.type}`) }} {{ formatDateDuration(item.createdAt) }} par {{ item.user }}</div>
                </v-card-text>
              </v-card>

            </v-timeline-item>

          </v-timeline>
        </v-card-text>
        <div class="text-xs-center">
          <v-pagination v-if="pagination.totalPages > 0" v-model="page" :length="pagination.totalPages"></v-pagination>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="close()">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>    
</template>

<script>
import { Meteor } from 'meteor/meteor'
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    taskId: String,
    active: Boolean
  },
  watch: {
    active(active) {
      if (active) {
        this.refresh();
      }
    },
    page(page) {
      this.refresh();
    },
  },
  data () {
    return {
      history: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:active", false);      
    },
    refresh () {
      this.loading = true;
      Meteor.call('tasks.getHistory', {taskId: this.taskId, page: this.page}, (error, result) => {
        this.loading = false;
        if (error) {
          this.$store.dispatch("notifyError", error);
          return;
        }
        this.pagination.totalItems = result.totalItems;
        this.pagination.rowsPerPage = result.rowsPerPage;
        this.pagination.totalPages = this.calculateTotalPages();
        this.history = result.data;
      })
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }

  }
}
</script>

<style scoped>
.content {
  overflow-y: auto;
  max-height: 450px;
  min-height: 450px;
}

</style>