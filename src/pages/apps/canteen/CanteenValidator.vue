<template>
  <div class="fill-height bg-grey-lighten-4 pa-6">
    <div class="text-center mb-6">
         <h1 class="text-h5 font-weight-bold">Canteen Order Validator</h1>
         <p class="text-caption">Staff App</p>
    </div>
   
    
    <v-row justify="center">
        <v-col cols="12" md="6" class="text-center">
            
            <!-- Scan Mode -->
            <v-card class="py-12 rounded-xl" v-if="state === 'scan'" elevation="2">
                <v-icon size="80" color="primary" class="mb-4">mdi-qrcode-scan</v-icon>
                <h2 class="text-h6 mt-4 mb-2">Scan Order QR</h2>
                <p class="text-grey mb-6 px-4">Ask customer to show the QR code generated after payment.</p>
                <v-btn size="x-large" color="primary" @click="simulateScan" class="rounded-pill px-8">Simulate Scan</v-btn>
            </v-card>

            <!-- Order Details Mode -->
            <v-card class="rounded-xl overflow-hidden" v-if="state === 'verify'" elevation="4">
                <div class="bg-primary pa-4 text-white">
                    <div class="text-subtitle-1 font-weight-bold">Order #12345</div>
                    <div class="text-caption">John Doe • Employee</div>
                </div>
                <v-card-text class="pa-4 text-left">
                    <div class="d-flex justify-space-between mb-2 pb-2 border-b">
                        <span>Veg Burger x 1</span>
                        <span class="font-weight-bold">₹50</span>
                    </div>
                    <div class="d-flex justify-space-between mb-4 pb-2 border-b">
                        <span>Coke x 1</span>
                        <span class="font-weight-bold">₹20</span>
                    </div>
                    
                    <div class="d-flex justify-space-between text-h6 font-weight-bold">
                        <span>Total Paid</span>
                        <span class="text-success">₹70 (Points)</span>
                    </div>
                </v-card-text>
                <div class="pa-4 bg-grey-lighten-5">
                    <v-btn block color="success" size="large" @click="markServed" class="mb-2">Mark as Served</v-btn>
                    <v-btn block variant="text" color="error" @click="state = 'scan'">Cancel</v-btn>
                </div>
            </v-card>

             <!-- Success Feedback -->
            <v-card class="py-12 bg-green-lighten-5 rounded-xl" v-if="state === 'success'" elevation="0">
                <v-icon size="80" color="success">mdi-check-all</v-icon>
                <h2 class="text-h5 font-weight-bold text-success mt-4">Order Served!</h2>
                <v-btn class="mt-8" variant="outlined" @click="state = 'scan'">Next Order</v-btn>
            </v-card>

        </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const state = ref('scan'); // scan, verify, success

const simulateScan = () => {
    state.value = 'verify';
};

const markServed = () => {
    state.value = 'success';
    setTimeout(() => {
        state.value = 'scan';
    }, 2000);
};
</script>
