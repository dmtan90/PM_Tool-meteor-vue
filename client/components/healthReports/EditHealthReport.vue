<template>
  <div class="edit-health-report">
    <select-date
      :active.sync="showSelectDate"
      :disable-time="true"
      @select="onSelectDate"
    />

    <v-dialog
      v-model="showDialog"
      fullscreen
    >
      <v-card v-if="report" class="flex-container">
        <v-toolbar dark color="primary" class="flex0">
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
            <span>{{ $t("Edit report") }}</span>
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text class="flex1">
          <v-form v-model="valid" @submit.prevent>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  :label="$t('Name')"
                  required
                />
              </v-flex>
              <v-flex xs12>
                <v-list two-line class="elevation-1 date">
                  <v-list-item @click="showSelectDate = true">
                    <v-list-item-avatar>
                      <v-icon>mdi-calendar-today</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t("Date") }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span v-show="date">{{ formatDate(date) }}</span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn text icon @click.stop="onSelectDate(null)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-flex>
              <v-flex xs12>
                <v-combobox
                  v-model="weather"
                  :items="items"
                  :label="$t('Project health')"
                >
                  <template slot="selection" slot-scope="data">
                    <img :src="getIcon(data.item)">
                  </template>
                  <template slot="item" slot-scope="data">
                    <img :src="getIcon(data.item)">
                  </template>
                </v-combobox>
              </v-flex>

              <v-flex xs12>
                <label>{{ $t("Description") }}</label>
                <rich-editor ref="description" v-model="description" />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions class="flex0 actions">
          <v-spacer />
          <v-btn text @click="showDialog = false">
            {{ $t("Cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid || !coherent"
            @click="create"
          >
            {{ $t("Update") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Meteor } from "meteor/meteor";
import DatesMixin from "/imports/ui/mixins/DatesMixin.js";
import moment from "moment";

export default {
  mixins: [DatesMixin],
  props: {
    report: {
      type: Object,
      default: () => {}
    }
  },
  i18n: {
    messages: {
      en: {
        "Edit report": "Edit report",
        Date: "Date",
        None: "None",
        "Weekly point": "Weekly point",
        "Project health": "Project health"
      },
      fr: {
        "Edit report": "Editer le bulletin",
        Date: "Date",
        None: "Aucune",
        "Weekly point": "Point hebdomadaire",
        "Project health": "Santé du projet"
      }
    }
  },
  data() {
    return {
      showDialog: false,
      showSelectDate: false,
      date: null,
      coherent: false,
      valid: false,
      name: "",
      weather: "",
      nameRules: [
        (v) => !!v || this.$t("Name is mandatory"),
        (v) => (v && v.length > 1) || this.$t("Name is too short")
      ],
      description: "",
      items: ["sunny", "cloudy", "storm"]
    };
  },
  methods: {
    open() {
      this.showDialog = true;
      this.$nextTick(() => {
        this.name = this.report.name;
        this.date = moment(this.report.date).format("YYYY-MM-DD");
        this.description = this.report.description;
        this.weather = this.report.weather;
        this.checkConsistency();
        this.$refs.description.focus();
      });
    },
    close() {
      this.showDialog = false;
    },
    onSelectDate(date) {
      this.date = date;
      this.checkConsistency();
    },
    checkConsistency() {
      if (!this.report.date) {
        this.coherent = false;
        return;
      }
      this.coherent = true;
    },
    create() {
      this.showDialog = false;
      Meteor.call(
        "healthReports.update",
        {
          id: this.report._id,
          name: this.name,
          description: this.description,
          date: this.date,
          weather: this.weather
        },
        (error) => {
          this.$emit("updated");
          if (error) {
            this.$store.dispatch("notifyError", error);
          }
        }
      );
      this.showDialog = false;
    },
    getIcon(weather) {
      return Meteor.absoluteUrl(`/weather/${weather}.svg`);
    }
  }
};
</script>

<style scoped>
.date {
  margin-bottom: 24px;
}

.flex-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex0 {
  flex: 0;
  height: 100%;
}

.flex1 {
  flex: 1; /* takes the remaining height of the "container" div */
  overflow: auto; /* to scroll just the "main" div */
}

.actions {
  min-height: 48px;
}

</style>
