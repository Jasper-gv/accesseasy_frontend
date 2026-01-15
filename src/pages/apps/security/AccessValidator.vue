<template>
  <div>
    <h1 class="text-h4 mb-4">Access Validator</h1>
    
    <v-row justify="center">
        <v-col cols="12" md="6" class="text-center">
            <v-card class="py-8" v-if="state === 'scan'">
                <v-icon size="80" color="primary">mdi-qrcode-scan</v-icon>
                <h2 class="text-h5 mt-4">Scan Visitor/Entry QR</h2>
                <p class="text-grey mb-6">Point camera at the pass</p>
                <v-btn size="x-large" color="primary" @click="simulateScan">Simulate Scan (Valid)</v-btn>
                <v-btn size="x-large" color="error" class="ml-2" @click="simulateScanInvalid">Simulate Scan (Invalid)</v-btn>
            </v-card>

            <v-card class="py-8 bg-green-lighten-5" v-if="state === 'allowed'">
                <v-icon size="100" color="success">mdi-check-circle</v-icon>
                <h2 class="text-h4 font-weight-bold text-success mt-4">ACCESS GRANTED</h2>
                <p class="text-h6 mt-2">VIP Guest Pass</p>
                <p class="text-grey">John Doe • Expires in 4 Hours</p>
                
                <v-btn class="mt-8" size="large" variant="outlined" @click="state = 'scan'">Scan Next</v-btn>
            </v-card>

            <v-card class="py-8 bg-red-lighten-5" v-if="state === 'denied'">
                <v-icon size="100" color="error">mdi-close-circle</v-icon>
                <h2 class="text-h4 font-weight-bold text-error mt-4">ACCESS DENIED</h2>
                <p class="text-h6 mt-2">Pass Expired or Invalid</p>
                
                <v-btn class="mt-8" size="large" variant="outlined" @click="state = 'scan'">Scan Next</v-btn>
            </v-card>
        </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const state = ref('scan'); // scan, allowed, denied

const simulateScan = () => {
    // In a real app, this would query backend with QR data
    state.value = 'allowed';
};

const simulateScanInvalid = () => {
    state.value = 'denied';
};
</script>
