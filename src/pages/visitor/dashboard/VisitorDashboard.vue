<template>
  <div class="visitor-dashboard pa-6">
    <v-container fluid>
      <!-- Header -->
      <div class="dashboard-header mb-6">
        <h1 class="text-h4 font-weight-bold">
          <v-icon icon="mdi-view-dashboard" class="mr-2" color="primary" />
          Visitor Management Dashboard
        </h1>
        <p class="text-body-1 text-grey-darken-1 mt-2">
          Overview of visitor activity and statistics
        </p>
      </div>

      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="primary" variant="tonal">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h3 font-weight-bold">{{ stats.todayCount }}</div>
                  <div class="text-body-2 mt-1">Today's Visitors</div>
                </div>
                <v-icon icon="mdi-account-multiple" size="48" />
              </div>
              <v-progress-linear
                :model-value="70"
                color="primary"
                class="mt-3"
                height="6"
                rounded
              />
              <div class="text-caption mt-1 text-grey-darken-1">
                +12% from yesterday
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="warning" variant="tonal">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h3 font-weight-bold">{{ stats.pendingCount }}</div>
                  <div class="text-body-2 mt-1">Pending Approvals</div>
                </div>
                <v-icon icon="mdi-clock-alert" size="48" />
              </div>
              <v-btn
                v-if="stats.pendingCount > 0"
                color="warning"
                variant="outlined"
                size="small"
                class="mt-3"
                @click="goToApprovals"
              >
                Review Now
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="success" variant="tonal">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h3 font-weight-bold">{{ stats.activeCount }}</div>
                  <div class="text-body-2 mt-1">Currently On-Site</div>
                </div>
                <v-icon icon="mdi-login" size="48" />
              </div>
              <div class="text-caption mt-3 text-grey-darken-1">
                Checked in visitors
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="info" variant="tonal">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h3 font-weight-bold">{{ stats.monthCount }}</div>
                  <div class="text-body-2 mt-1">This Month</div>
                </div>
                <v-icon icon="mdi-calendar-month" size="48" />
              </div>
              <div class="text-caption mt-3 text-grey-darken-1">
                Total visitors
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Visitor Trend Chart -->
        <v-col cols="12" md="8">
          <v-card class="chart-card">
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-chart-line" class="mr-2" color="primary" />
              Visitor Trend (Last 7 Days)
            </v-card-title>
            <v-card-text>
              <div class="chart-placeholder">
                <v-simple-table>
                  <template #default>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Visitors</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="day in stats.dailyTrend" :key="day.date">
                        <td>{{ formatDate(day.date) }}</td>
                        <td class="font-weight-bold">{{ day.count }}</td>
                        <td>
                          <v-progress-linear
                            :model-value="(day.count / maxDailyCount) * 100"
                            color="primary"
                            height="8"
                            rounded
                          />
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Purpose Breakdown -->
        <v-col cols="12" md="4">
          <v-card class="chart-card">
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-chart-pie" class="mr-2" color="secondary" />
              Purpose Breakdown
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(count, purpose) in stats.purposeBreakdown"
                  :key="purpose"
                >
                  <template #prepend>
                    <v-icon :icon="getPurposeIcon(purpose)" size="20" />
                  </template>
                  <v-list-item-title>{{ purpose }}</v-list-item-title>
                  <template #append>
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ count }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-history" class="mr-2" color="info" />
              Recent Activity
            </v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>Purpose</th>
                    <th>Visit Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="visitor in stats.recentVisitors" :key="visitor.id">
                    <td class="font-weight-medium">{{ visitor.personName }}</td>
                    <td>{{ visitor.purpose }}</td>
                    <td>{{ formatDate(visitor.visitDate) }}</td>
                    <td>{{ visitor.startTime }} - {{ visitor.endTime }}</td>
                    <td>
                      <VisitorStatusBadge :status="visitor.status" />
                    </td>
                    <td>
                      <v-chip size="small" variant="outlined">
                        {{ visitor.registrationType }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card color="grey-lighten-4" variant="tonal">
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-lightning-bolt" class="mr-2" color="warning" />
              Quick Actions
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-3">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-link-variant"
                  @click="generateLink"
                >
                  Generate Pre-shared Link
                </v-btn>
                <v-btn
                  color="warning"
                  prepend-icon="mdi-check-circle"
                  @click="goToApprovals"
                >
                  View Pending Approvals
                </v-btn>
                <v-btn
                  color="info"
                  prepend-icon="mdi-download"
                  @click="exportReport"
                >
                  Export Report
                </v-btn>
                <v-btn
                  color="secondary"
                  prepend-icon="mdi-qrcode"
                  @click="goToReception"
                >
                  Reception QR
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { visitorService } from '@/services/visitorService';
import VisitorStatusBadge from '@/components/visitor/VisitorStatusBadge.vue';

const router = useRouter();

const stats = ref({
  todayCount: 0,
  monthCount: 0,
  pendingCount: 0,
  activeCount: 0,
  purposeBreakdown: {},
  dailyTrend: [],
  recentVisitors: [],
});

onMounted(async () => {
  await fetchStats();
});

const fetchStats = async () => {
  try {
    const data = await visitorService.getVisitorStats();
    stats.value = data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const maxDailyCount = computed(() => {
  return Math.max(...stats.value.dailyTrend.map(d => d.count), 1);
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getPurposeIcon = (purpose) => {
  const icons = {
    Meeting: 'mdi-account-group',
    Interview: 'mdi-briefcase',
    Delivery: 'mdi-package-variant',
    Maintenance: 'mdi-tools',
    Contractor: 'mdi-hard-hat',
    Other: 'mdi-dots-horizontal',
  };
  return icons[purpose] || 'mdi-help-circle';
};

const goToApprovals = () => {
  router.push({ path: '/visitor-management', query: { tab: 'approvals' } });
};

const generateLink = () => {
  router.push({ path: '/visitor-management', query: { tab: 'generate-link' } });
};

const goToReception = () => {
  router.push({ path: '/visitor-management', query: { tab: 'reception' } });
};

const exportReport = () => {
  alert('Export functionality coming soon!');
};
</script>

<style scoped>
.visitor-dashboard {
  background: #f5f7fa;
  min-height: 100vh;
}

.stat-card {
  border-radius: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.chart-card {
  border-radius: 16px;
  height: 100%;
}

.chart-placeholder {
  min-height: 300px;
}

.gap-3 {
  gap: 12px;
}
</style>
