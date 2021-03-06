<template>
  <div class="task-history">
    <v-dialog
      :value="active"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="60%"
      @input="$emit('update:active')"
    >
      <v-toolbar dark color="primary">
        <v-btn
          v-shortkey="['esc']"
          icon
          text
          @click="close()"
          @shortkey="close()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          {{ $t("History") }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card class="flex-container">
        <v-card-text class="flex1">
          <v-progress-linear v-if="loading" indeterminate />

          <v-timeline v-if="!loading" clipped dense>
            <v-timeline-item
              v-for="item in history"
              :key="item._id"
              color="indigo"
              :small="$vuetify.breakpoint.xsOnly"
            >
              <span slot="opposite" />
              <v-card class="elevation-2">
                <v-card-text>
                  <div>
                    {{ $t(`history.${item.type}`) }}
                    {{ formatDateDuration(item.createdAt) }} par {{ item.user }}
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <div class="flex0">
          <div class="text-xs-center">
            <v-pagination
              v-if="active && pagination.totalPages > 0"
              v-model="page"
              :length="pagination.totalPages"
            />
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="close()">
              {{ this.$t("Close") }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";

export default {
  mixins: [DatesMixin],
  props: {
    taskId: {
      type: String,
      default: ""
    },
    active: Boolean
  },
  data() {
    return {
      history: [],
      loading: true,
      page: 1,
      pagination: {
        totalItems: 0,
        rowsPerPage: 0,
        totalPages: 0
      }
    };
  },
  watch: {
    active(active) {
      if (active) {
        this.refresh();
      }
    },
    page() {
      this.refresh();
    }
  },
  methods: {
    close() {
      this.$emit("update:active", false);
    },
    refresh() {
      this.loading = true;
      Meteor.call(
        "tasks.getHistory",
        { taskId: this.taskId, page: this.page },
        (error, result) => {
          this.loading = false;
          if (error) {
            this.$store.dispatch("notifyError", error);
            return;
          }
          this.pagination.totalItems = result.totalItems;
          this.pagination.rowsPerPage = result.rowsPerPage;
          this.pagination.totalPages = this.calculateTotalPages();
          this.history = result.data;
        }
      );
    },

    calculateTotalPages() {
      if (
        this.pagination.rowsPerPage == null
        || this.pagination.totalItems == null
      ) {
        return 0;
      }

      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  }
};
</script>

<style scoped>
@media (min-width: 601px) {
  .flex-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 200px);
    min-height: 360px;
    max-height: 530px;
  }

  .flex0 {
    flex: 0;
  }

  .flex1 {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>
