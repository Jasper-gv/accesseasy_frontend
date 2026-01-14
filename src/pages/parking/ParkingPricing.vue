<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Pricing</h1>
      <v-btn prepend-icon="mdi-pencil" variant="outlined" color="primary">
        Edit Rates
      </v-btn>
    </div>

    <v-row>
      <!-- Car Rates -->
      <v-col cols="12" md="6">
        <v-card border elevation="0" class="h-100">
          <v-card-item class="bg-primary-lighten-5">
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" class="mr-2">
                <v-icon>mdi-car</v-icon>
              </v-avatar>
            </template>
            <v-card-title>Car Rates</v-card-title>
            <v-card-subtitle>Standard Four-Wheeler</v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4">
            <v-list lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$5.00</v-list-item-title>
                <v-list-item-subtitle>Per Hour</v-list-item-subtitle>
              </v-list-item>
              
              <v-divider inset></v-divider>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-calendar-today</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$35.00</v-list-item-title>
                <v-list-item-subtitle>Daily Max (24h)</v-list-item-subtitle>
              </v-list-item>

              <v-divider inset></v-divider>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-ticket-account</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$150.00</v-list-item-title>
                <v-list-item-subtitle>Monthly Pass</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Bike Rates -->
      <v-col cols="12" md="6">
        <v-card border elevation="0" class="h-100">
          <v-card-item class="bg-orange-lighten-5">
            <template v-slot:prepend>
              <v-avatar color="orange-darken-2" variant="tonal" class="mr-2">
                <v-icon>mdi-motorbike</v-icon>
              </v-avatar>
            </template>
            <v-card-title>Bike Rates</v-card-title>
            <v-card-subtitle>Two-Wheeler / Motorcycle</v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4">
            <v-list lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$2.00</v-list-item-title>
                <v-list-item-subtitle>Per Hour</v-list-item-subtitle>
              </v-list-item>
              
              <v-divider inset></v-divider>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-calendar-today</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$12.00</v-list-item-title>
                <v-list-item-subtitle>Daily Max (24h)</v-list-item-subtitle>
              </v-list-item>

              <v-divider inset></v-divider>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="grey" class="mr-4">mdi-ticket-account</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-h6">$50.00</v-list-item-title>
                <v-list-item-subtitle>Monthly Pass</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// Hardcoded rates for demo
</script>

<style scoped>
.bg-primary-lighten-5 {
  background-color: #E3F2FD !important;
}
.bg-orange-lighten-5 {
  background-color: #FFF3E0 !important;
}
</style>
