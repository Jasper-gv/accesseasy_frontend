<template>
  <v-app>
    <v-app-bar color="white" elevation="1">
      <v-toolbar-title class="text-primary font-weight-bold">Tasty Bites</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- User / Login -->
      <v-btn variant="text" size="small" v-if="!user" @click="loginDialog = true" color="primary">
        Emp Login
      </v-btn>
      <div v-else class="mr-4 text-right">
        <div class="text-caption font-weight-bold">{{ user.name }}</div>
        <div class="text-caption text-success font-weight-bold">{{ wallet ? `₹${wallet.points}` : '0 Pts' }}</div>
      </div>

      <!-- Cart -->
      <v-menu v-model="cartOpen" :close-on-content-click="false" location="bottom end">
        <template v-slot:activator="{ props }">
             <v-btn icon color="grey-darken-2" v-bind="props">
                <v-badge :content="cartTotalItems" color="error" v-if="cartTotalItems > 0">
                    <v-icon>mdi-cart-outline</v-icon>
                </v-badge>
                <v-icon v-else>mdi-cart-outline</v-icon>
            </v-btn>
        </template>
        
        <v-card width="350">
            <v-card-title>Your Cart</v-card-title>
            <v-divider></v-divider>
            <v-card-text v-if="cart.length === 0" class="text-center text-grey py-8">Cart is empty</v-card-text>
            <div v-else>
                <v-list density="compact" class="overflow-y-auto" style="max-height: 300px;">
                    <v-list-item v-for="item in cart" :key="item.id">
                        <template v-slot:prepend>
                             <v-avatar rounded size="32">
                                <v-img :src="item.image" cover></v-img>
                             </v-avatar>
                        </template>
                        <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.quantity }} x ₹{{ item.price }}</v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-minus" size="x-small" variant="text" density="compact" @click="updateQuantity(item, -1)"></v-btn>
                            <span class="mx-1 text-caption">{{ item.quantity }}</span>
                            <v-btn icon="mdi-plus" size="x-small" variant="text" density="compact" @click="updateQuantity(item, 1)"></v-btn>
                        </template>
                    </v-list-item>
                </v-list>
                
                <v-divider></v-divider>
                <div class="pa-4 bg-grey-lighten-5">
                    <div class="d-flex justify-space-between mb-2 text-h6 font-weight-bold">
                        <span>Total</span>
                        <span>₹{{ cartTotalValue }}</span>
                    </div>

                    <!-- Payment Options -->
                    <div v-if="user && wallet" class="mb-3 pa-3 bg-white rounded border">
                        <div class="d-flex justify-space-between mb-2">
                            <span class="text-caption">Wallet Balance</span>
                            <span class="text-caption font-weight-bold">₹{{ wallet.points }}</span>
                        </div>
                        <v-btn 
                            block 
                            color="secondary" 
                            variant="flat" 
                            size="small" 
                            :disabled="wallet.points < cartTotalValue" 
                            @click="placeOrder('Wallet')"
                            :loading="ordering && paymentMode === 'Wallet'"
                        >
                            Pay with Wallet
                        </v-btn>
                        <div v-if="wallet.points < cartTotalValue" class="text-center text-caption text-error mt-1">Insufficient Points</div>
                    </div>

                    <v-btn 
                        block 
                        color="primary" 
                        @click="placeOrder('Cash/UPI')" 
                        :loading="ordering && paymentMode === 'Cash/UPI'"
                    >
                        Pay Cash / UPI
                    </v-btn>
                </div>
            </div>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <v-container class="pa-4">
        <!-- Categories -->
        <div class="d-flex overflow-x-auto mb-4 pb-2" style="gap: 12px;">
          <v-chip 
            v-for="cat in ['All', 'Meals', 'Snacks', 'Beverages']"
            :key="cat"
            :color="selectedCategory === cat ? 'primary' : 'default'"
            :variant="selectedCategory === cat ? 'flat' : 'outlined'"
            filter
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </v-chip>
        </div>

        <!-- Menu List -->
        <h3 class="text-h6 font-weight-bold mt-4 mb-3">Menu</h3>
        <v-alert v-if="user" type="success" variant="tonal" class="mb-4" density="compact">
            You are viewing discounted Employee prices!
        </v-alert>

        <v-progress-circular v-if="loading" indeterminate color="primary" class="d-flex mx-auto"></v-progress-circular>
        
        <v-row v-else>
            <v-col cols="12" md="6" v-for="item in filteredMenu" :key="item.id">
                 <v-card class="mb-3 rounded-lg pa-2" elevation="0" :disabled="!item.available">
                    <div class="d-flex">
                        <v-avatar size="80" class="rounded-lg">
                            <v-img :src="item.image" cover class="bg-grey-lighten-2"></v-img>
                        </v-avatar>
                        <div class="ml-3 flex-grow-1">
                            <div class="d-flex justify-space-between">
                                <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
                                 <v-chip v-if="!item.available" size="x-small" color="error">Sold Out</v-chip>
                            </div>
                            <div class="text-caption text-grey-darken-1">{{ item.category }}</div>
                            <div class="d-flex justify-space-between align-center mt-2">
                                <div>
                                    <span v-if="user" class="text-decoration-line-through text-caption text-grey mr-1">₹{{ item.originalPrice }}</span>
                                    <span class="font-weight-bold text-primary">₹{{ item.price }}</span>
                                </div>
                                <v-btn 
                                    size="small" 
                                    variant="tonal" 
                                    color="primary" 
                                    @click="addToCart(item)"
                                    :disabled="!item.available"
                                >
                                    Add
                                </v-btn>
                            </div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Login Dialog -->
    <v-dialog v-model="loginDialog" max-width="350">
        <v-card title="Employee Login">
            <v-card-text>
                <div class="text-caption text-grey mb-2">Login to access wallet & discounts.</div>
                <v-text-field v-model="empIdInput" label="Employee ID" variant="outlined" hide-details class="mb-2"></v-text-field>
                <div class="text-center text-caption text-grey">For demo, use 'EMP001'</div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="loginDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="login">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <!-- Order Success Dialog -->
    <v-dialog v-model="successDialog" max-width="320" persistent>
        <v-card class="text-center pa-6">
            <v-icon size="64" color="success">mdi-check-circle-outline</v-icon>
            <h3 class="text-h6 mt-2 font-weight-bold">Order Placed!</h3>
            <p class="text-caption text-grey mb-4">Show this QR to counter staff</p>
            
            <div class="bg-white pa-3 rounded border d-inline-block mb-4">
                 <v-icon size="100" color="black">mdi-qrcode</v-icon>
            </div>
            
            <div class="text-body-2 bg-grey-lighten-4 pa-2 rounded">
                <div>Order #{{ lastOrder?.id }}</div>
                <div class="font-weight-bold">Paid: ₹{{ lastOrder?.total }} ({{ lastOrder?.paymentMode }})</div>
            </div>

            <v-btn block color="primary" class="mt-6" @click="successDialog = false">Close</v-btn>
        </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { canteenService } from '@/services/appLayer/canteenService';
import { walletService } from '@/services/appLayer/walletService';

const menu = ref([]);
const cart = ref([]);
const loading = ref(true);
const ordering = ref(false);
const selectedCategory = ref('All');
const cartOpen = ref(false);
const successDialog = ref(false);
const lastOrder = ref(null);
const loginDialog = ref(false);
const user = ref(null);
const wallet = ref(null);
const empIdInput = ref('EMP001');
const paymentMode = ref('');

const filteredMenu = computed(() => {
    let items = menu.value;
    if (selectedCategory.value !== 'All') {
        items = items.filter(i => i.category === selectedCategory.value);
    }
    // Apply dynamic pricing if user is logged in
    return items.map(i => ({
        ...i,
        originalPrice: i.price,
        price: user.value ? Math.floor(i.price * 0.8) : i.price // 20% discount logic
    }));
});

const cartTotalItems = computed(() => cart.value.reduce((acc, item) => acc + item.quantity, 0));
const cartTotalValue = computed(() => cart.value.reduce((acc, item) => acc + (item.price * item.quantity), 0));

const loadMenu = async () => {
    loading.value = true;
    try {
        menu.value = await canteenService.getMenu();
    } catch(e) { console.error(e); } 
    finally { loading.value = false; }
};

const login = async () => {
    if(!empIdInput.value) return;
    try {
        user.value = { id: empIdInput.value, name: 'John Doe' };
        wallet.value = await walletService.getBalance(user.value.id);
        loginDialog.value = false;
        cart.value = []; // Clear cart on login to avoid price mismatch
    } catch (e) { console.error(e); }
};

const addToCart = (item) => {
    const existing = cart.value.find(i => i.id === item.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.value.push({ ...item, quantity: 1 });
    }
    cartOpen.value = true;
};

const updateQuantity = (item, delta) => {
    const target = cart.value.find(i => i.id === item.id);
    if (target) {
        target.quantity += delta;
        if (target.quantity <= 0) {
            removeFromCart(item.id);
        }
    }
};

const removeFromCart = (id) => {
    cart.value = cart.value.filter(i => i.id !== id);
};

const placeOrder = async (mode) => {
    ordering.value = true;
    paymentMode.value = mode;
    try {
        if (mode === 'Wallet' && user.value) {
             await walletService.deductPoints(user.value.id, cartTotalValue.value, 'Canteen Order');
             wallet.value = await walletService.getBalance(user.value.id);
        }

        const items = cart.value.map(i => ({...i})); // deep copy
        lastOrder.value = await canteenService.placeOrder(items, cartTotalValue.value); // Updated signature
        lastOrder.value.total = cartTotalValue.value;
        lastOrder.value.paymentMode = mode;
        lastOrder.value.id = Math.floor(Math.random() * 100000); // Mock ID

        cart.value = [];
        cartOpen.value = false;
        successDialog.value = true;
    } catch (e) {
        alert('Order failed: ' + e.message);
    } finally {
        ordering.value = false;
    }
};

onMounted(loadMenu);
</script>
