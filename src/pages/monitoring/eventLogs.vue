<template>
  <div class="event-logs-container">
    <div class="header-actions mb-4">
      <h2>AI Event Logs</h2>
      <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshLogs">
        Refresh
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="events"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.timestamp="{ item }">
          {{ formatTimestamp(item.timestamp) }}
        </template>
        
        <template v-slot:item.severity="{ item }">
          <v-chip
            :color="getSeverityColor(item.severity)"
            size="small"
          >
            {{ item.severity }}
          </v-chip>
        </template>

        <template v-slot:item.snapshot="{ item }">
          <v-img
            :src="item.snapshotUrl"
            width="80"
            height="45"
            cover
            class="rounded bg-grey-lighten-2"
          ></v-img>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            variant="text"
            prepend-icon="mdi-play-circle"
            @click="playVideo(item)"
          >
            Play
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Video Player Dialog Placeholder -->
    <v-dialog v-model="videoDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Event Playback</span>
          <v-btn icon="mdi-close" variant="text" @click="videoDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <div style="height: 450px;">
            <VideoPlayer
              v-if="selectedEvent"
              :video-url="selectedEvent.videoUrl"
              :poster-url="selectedEvent.snapshotUrl"
              autoplay
            />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VideoPlayer from '@/components/VideoPlayer.vue';

const loading = ref(false);
const videoDialog = ref(false);
const selectedEvent = ref(null);

const headers = [
  { title: 'Snapshot', key: 'snapshot', sortable: false },
  { title: 'Timestamp', key: 'timestamp' },
  { title: 'Event Type', key: 'type' },
  { title: 'Camera', key: 'cameraName' },
  { title: 'Location', key: 'location' },
  { title: 'Severity', key: 'severity' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const events = ref([
  {
    id: 1,
    timestamp: new Date().toISOString(),
    type: 'Unauthorized Entry',
    cameraName: 'Main Entrance Cam',
    location: 'Headquarters',
    severity: 'High',
    snapshotUrl: 'https://via.placeholder.com/160x90?text=Snapshot',
    videoUrl: '#',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'Tailgating Detected',
    cameraName: 'Warehouse Back Door',
    location: 'Warehouse A',
    severity: 'Medium',
    snapshotUrl: 'https://via.placeholder.com/160x90?text=Snapshot',
    videoUrl: '#',
  },
]);

const formatTimestamp = (isoString) => {
  return new Date(isoString).toLocaleString();
};

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

const refreshLogs = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const playVideo = (item) => {
  selectedEvent.value = item;
  videoDialog.value = true;
};
</script>

<style scoped>
.event-logs-container {
  padding: 20px;
}
</style>
