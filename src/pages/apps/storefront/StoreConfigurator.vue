<template>
  <div v-if="placeId" class="storefront-config">
    <v-tabs 
      v-model="activeTab" 
      bg-color="transparent" 
      class="custom-tabs"
      show-arrows
    >
      <v-tab value="branding" class="custom-tab">
        <v-icon start>mdi-palette</v-icon> 
        Branding & Features
      </v-tab>
      <v-tab v-if="config.modules.visitor" value="visitor-settings" class="custom-tab">
        <v-icon start>mdi-account-cog</v-icon> 
        Visitor Settings
      </v-tab>
      <v-tab v-if="config.modules.parking" value="parking-settings" class="custom-tab">
        <v-icon start>mdi-car-cog</v-icon> 
        Parking Settings
      </v-tab>
      <v-tab v-if="config.modules.canteen" value="canteen-settings" class="custom-tab">
        <v-icon start>mdi-food-fork-drink</v-icon> 
        Canteen Settings
      </v-tab>
      <v-tab value="domain" class="custom-tab">
        <v-icon start>mdi-web</v-icon> 
        Custom Domain
      </v-tab>
      <v-tab v-if="config.modules.wallet" value="wallet" class="custom-tab">
        <v-icon start>mdi-wallet-membership</v-icon> 
        Wallet & Features
      </v-tab>
      <v-tab v-if="config.modules.membership" value="plan" class="custom-tab">
        <v-icon start>mdi-card-account-details-outline</v-icon> 
        Membership Plans
      </v-tab>
    </v-tabs>

    <!-- Feature Design Row with Save Button -->
    <div class="d-flex justify-end align-center mb-4">
      <BaseButton 
        text="Save All Changes" 
        variant="primary" 
        size="lg"
        :loading="saving"
        @click="save"
      />
    </div>

    <v-card class="tab-content-wrapper" elevation="0">
      <v-window v-model="activeTab">
        <!-- All window items remain the same -->
        <!-- TAB 1: Branding (Enhanced) -->
        <v-window-item value="branding">
            <v-row>
                <v-col cols="12" md="7">
                    <v-card class="mb-6 elevation-2">
                        <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
                            <v-icon color="primary" class="mr-2">mdi-palette</v-icon>
                            Brand Identity
                        </v-card-title>
                        <v-card-text class="pa-6">
                            <v-text-field 
                                v-model="config.appName" 
                                label="Application Display Name" 
                                variant="outlined" 
                                prepend-inner-icon="mdi-rename"
                                class="mb-4"
                            ></v-text-field>

                            <div class="text-subtitle-1 font-weight-bold mb-4">Color Palette</div>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="config.theme.primary" label="Primary Color" variant="outlined" density="comfortable">
                                        <template v-slot:append-inner>
                                            <div :style="{ backgroundColor: config.theme.primary, width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', position: 'relative', overflow: 'hidden' }">
                                                <input type="color" v-model="config.theme.primary" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                            </div>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="config.theme.secondary" label="Secondary Color" variant="outlined" density="comfortable">
                                        <template v-slot:append-inner>
                                            <div :style="{ backgroundColor: config.theme.secondary, width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', position: 'relative', overflow: 'hidden' }">
                                                <input type="color" v-model="config.theme.secondary" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                            </div>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="config.theme.background" label="Background Color" variant="outlined" density="comfortable">
                                        <template v-slot:append-inner>
                                            <div :style="{ backgroundColor: config.theme.background, width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', position: 'relative', overflow: 'hidden' }">
                                                <input type="color" v-model="config.theme.background" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                            </div>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field v-model="config.theme.accent" label="Accent Color" variant="outlined" density="comfortable">
                                        <template v-slot:append-inner>
                                            <div :style="{ backgroundColor: config.theme.accent, width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ccc', position: 'relative', overflow: 'hidden' }">
                                                <input type="color" v-model="config.theme.accent" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                            </div>
                                        </template>
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <v-divider class="my-6"></v-divider>

                            <div class="text-subtitle-1 font-weight-bold mb-4">Logo Selection</div>
                            <div class="d-flex align-center gap-3 mb-4">
                                <v-text-field v-model="config.logoUrl" label="Logo URL" variant="outlined" placeholder="https://..." hide-details style="flex-grow: 1"></v-text-field>
                                <v-btn color="primary" variant="tonal" height="56" prepend-icon="mdi-cloud-upload" @click="triggerLogoUpload">
                                    Upload
                                </v-btn>
                                <input type="file" ref="logoInput" class="d-none" accept="image/*" @change="handleLogoUpload">
                            </div>
                            
                            <div class="text-caption text-grey mb-2">Or Choose from Gallery</div>
                            <div class="d-flex flex-wrap gap-2">
                                <v-hover v-for="(logo, i) in logoGallery" :key="i" v-slot="{ isHovering, props }">
                                    <v-avatar 
                                        v-bind="props"
                                        size="64" 
                                        rounded 
                                        :class="config.logoUrl === logo ? 'border-primary border-2' : 'border'"
                                        class="cursor-pointer transition-swing"
                                        :elevation="isHovering ? 4 : 0"
                                        @click="config.logoUrl = logo"
                                    >
                                        <v-img :src="logo" cover></v-img>
                                        <v-overlay v-if="config.logoUrl === logo" :model-value="true" contained class="align-center justify-center">
                                            <v-icon color="white">mdi-check-circle</v-icon>
                                        </v-overlay>
                                    </v-avatar>
                                </v-hover>
                            </div>
                        </v-card-text>
                    </v-card>

                    <v-card class="mb-6 elevation-2">
                        <v-card-title class="pa-4 bg-grey-lighten-5">Feature Modules</v-card-title>
                        <v-card-text class="pa-6">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-switch v-model="config.modules.visitor" color="primary" label="Visitor Management" hide-details class="mb-2"></v-switch>
                                    <v-switch v-model="config.modules.parking" color="primary" label="Parking Access" hide-details class="mb-2"></v-switch>
                                    <v-switch v-model="config.modules.membership" color="primary" label="Membership & Plans" hide-details></v-switch>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-switch v-model="config.modules.canteen" color="primary" label="Canteen & Ordering" hide-details class="mb-2"></v-switch>
                                    <v-switch v-model="config.modules.security" color="primary" label="Staff Security Portal" hide-details class="mb-2"></v-switch>
                                    <v-switch v-model="config.modules.wallet" color="primary" label="Wallet & Points" hide-details></v-switch>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="5">
                   <div class="position-sticky" style="top: 20px;">
                        <h3 class="text-h6 mb-2 text-center text-grey">PWA Live Preview</h3>
                        <div class="phone-frame mx-auto elevation-10 rounded-xl overflow-hidden border-4 border-grey-darken-4" :style="{ backgroundColor: config.theme.background }">
                            <!-- Preview Header -->
                            <div class="pa-4 text-white d-flex align-center flex-column" :style="{ backgroundColor: config.theme.primary }">
                                <div class="d-flex align-center w-100">
                                    <v-icon icon="mdi-menu" class="mr-2"></v-icon>
                                    <span class="font-weight-bold">{{ config.appName }}</span>
                                    <v-spacer></v-spacer>
                                    <v-icon>mdi-account-circle</v-icon>
                                </div>
                                <div class="mt-6 mb-2" v-if="config.logoUrl">
                                    <img :src="config.logoUrl" style="max-height: 50px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
                                </div>
                            </div>
                            
                            <!-- Preview Content -->
                            <div class="pa-4 overflow-y-auto" style="height: 450px;">
                                <v-card :style="{ borderTop: `4px solid ${config.theme.secondary}` }" class="mb-4 pa-3 text-center rounded-lg">
                                    <div class="text-h6 font-weight-bold">Welcome</div>
                                    <p class="text-caption text-grey">Select a service to get started</p>
                                </v-card>

                                <div class="d-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div v-if="config.modules.visitor" class="preview-tile pa-3 rounded-lg text-center" :style="{ border: `1px solid ${config.theme.primary}40`, backgroundColor: 'white' }">
                                        <v-icon :color="config.theme.primary" size="32">mdi-account-plus</v-icon>
                                        <div class="text-caption font-weight-bold mt-1">Visitor</div>
                                    </div>
                                    <div v-if="config.modules.parking" class="preview-tile pa-3 rounded-lg text-center" :style="{ border: `1px solid ${config.theme.primary}40`, backgroundColor: 'white' }">
                                        <v-icon :color="config.theme.primary" size="32">mdi-parking</v-icon>
                                        <div class="text-caption font-weight-bold mt-1">Parking</div>
                                    </div>
                                    <div v-if="config.modules.canteen" class="preview-tile pa-3 rounded-lg text-center" :style="{ border: `1px solid ${config.theme.primary}40`, backgroundColor: 'white' }">
                                        <v-icon :color="config.theme.primary" size="32">mdi-food</v-icon>
                                        <div class="text-caption font-weight-bold mt-1">Canteen</div>
                                    </div>
                                    <div v-if="config.modules.membership" class="preview-tile pa-3 rounded-lg text-center" :style="{ border: `1px solid ${config.theme.primary}40`, backgroundColor: 'white' }">
                                        <v-icon :color="config.theme.primary" size="32">mdi-wallet-membership</v-icon>
                                        <div class="text-caption font-weight-bold mt-1">Members</div>
                                    </div>
                                </div>

                                <v-btn block :color="config.theme.secondary" class="mt-6 text-none rounded-pill" size="small">
                                    Get Assistance
                                </v-btn>
                            </div>
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-window-item>

        <!-- TAB: Canteen Settings -->
        <v-window-item v-if="config.modules.canteen" value="canteen-settings">
        <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
            <v-row>
                <v-col cols="12" md="8">
                    <v-card class="mb-6 elevation-2">
                        <v-card-title class="pa-4 bg-orange-lighten-5 d-flex align-center">
                            <v-icon color="orange" class="mr-2">mdi-food-fork-drink</v-icon>
                            <span class="text-h6 font-weight-bold">Canteen Management</span>
                        </v-card-title>
                        <v-card-text class="pa-6">
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="config.canteenSettings.canteenName"
                                        label="Canteen Display Name"
                                        variant="outlined"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model="config.canteenSettings.operationalHours"
                                        label="Operational Hours"
                                        variant="outlined"
                                        placeholder="e.g. 08:00 AM - 08:00 PM"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch
                                        v-model="config.canteenSettings.allowPreOrder"
                                        color="orange"
                                        label="Allow Digital Pre-Ordering"
                                        hide-details
                                        class="mb-2"
                                    ></v-switch>
                                    <v-switch
                                        v-model="config.canteenSettings.enableWalletPayments"
                                        color="orange"
                                        label="Enable Wallet/Points Payment"
                                        hide-details
                                    ></v-switch>
                                </v-col>
                            </v-row>

                            <v-divider class="my-6"></v-divider>
                            <div class="d-flex align-center justify-space-between mb-4">
                                <h3 class="text-subtitle-1 font-weight-bold">Menu Categories</h3>
                                <v-btn size="small" color="orange" variant="tonal" prepend-icon="mdi-plus">Add Category</v-btn>
                            </div>
                            <div class="d-flex flex-wrap gap-2">
                                <v-chip
                                    v-for="(cat, index) in config.canteenSettings.categories"
                                    :key="index"
                                    closable
                                    color="orange"
                                    variant="outlined"
                                >
                                    {{ cat }}
                                </v-chip>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card elevation="2" class="bg-grey-lighten-4">
                        <v-card-text class="pa-4">
                            <div class="text-subtitle-2 font-weight-bold mb-2">Canteen Integration</div>
                            <p class="text-caption text-grey-darken-1 mb-4">
                                Operational settings for the canteen module. Products and menu items are managed via the dedicated Canteen Dashboard.
                            </p>
                            <v-btn block color="orange" variant="flat" to="/apps/canteen">
                                Open Canteen Manager
                                <v-icon end>mdi-open-in-new</v-icon>
                            </v-btn>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        </v-window-item>


        <!-- TAB: Visitor Settings -->
        <v-window-item v-if="config.modules.visitor" value="visitor-settings">
            <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
                <v-row>
                    <v-col cols="12" md="8">
                        <!-- Template Manager -->
                        <v-card class="mb-6 elevation-2">
                            <v-card-title class="pa-4 bg-blue-lighten-5 d-flex align-center justify-space-between">
                                <div class="d-flex align-center">
                                    <v-icon color="blue" class="mr-2">mdi-account-details</v-icon>
                                    <div>
                                        <div class="text-h6 font-weight-bold">Visitor Form Templates</div>
                                        <div class="text-caption text-grey-darken-2">Create multiple entry forms for different visitor types</div>
                                    </div>
                                </div>
                                <v-btn color="blue" prepend-icon="mdi-plus" @click="openTemplateDialog('Visitor')">
                                    Add Visitor Type
                                </v-btn>
                            </v-card-title>
                            <v-card-text class="pa-4">
                                <v-row v-if="visitorTemplates.length">
                                    <v-col v-for="temp in visitorTemplates" :key="temp.id" cols="12" sm="6">
                                        <v-card variant="outlined" class="pa-4 border-dashed">
                                            <div class="d-flex justify-space-between align-start mb-2">
                                                <div class="text-subtitle-1 font-weight-bold">{{ temp.name }}</div>
                                                <div class="d-flex gap-1">
                                                    <v-btn icon="mdi-pencil" size="x-small" variant="text" color="blue" @click="openTemplateDialog('Visitor', temp)"></v-btn>
                                                    <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteTemplate(temp.id)"></v-btn>
                                                </div>
                                            </div>
                                            <div class="d-flex align-center mb-3">
                                                <v-chip size="x-small" color="blue" class="mr-2">{{ temp.accessMode }}</v-chip>
                                                <v-chip size="x-small" color="success" v-if="temp.membershipPlanId">
                                                    <v-icon start size="12">mdi-tag</v-icon>
                                                    {{ membershipPlansList.find(p => p.id === temp.membershipPlanId)?.name || 'Tagged Plan' }}
                                                </v-chip>
                                            </div>
                                            <div class="text-caption text-grey">Linked Access: {{ temp.membershipPlanId ? 'Membership Level' : 'Standard Guest' }}</div>
                                        </v-card>
                                    </v-col>
                                </v-row>
                                <div v-else class="text-center pa-8 border-dashed rounded-lg bg-grey-lighten-4">
                                    <v-icon size="48" color="grey-lighten-1">mdi-account-multiple-plus</v-icon>
                                    <div class="text-subtitle-1 text-grey-darken-1 mt-2">No templates configured</div>
                                    <v-btn variant="text" color="blue" size="small" @click="openTemplateDialog('Visitor')">Create your first form</v-btn>
                                </div>
                            </v-card-text>
                        </v-card>

                        <v-card class="mb-4" elevation="3">
                            <v-card-title class="pa-4 bg-grey-lighten-5">
                                <v-icon class="mr-2" color="blue">mdi-cog</v-icon>
                                <span class="text-h6 font-weight-bold">Global Entry Rules</span>
                            </v-card-title>
                            <v-card-text class="pa-6">
                                <v-switch 
                                    v-model="config.visitorSettings.requirePreApproval"
                                    label="Require pre-approval for all visitors"
                                    hint="Visitors must be approved before entry"
                                    persistent-hint
                                    color="blue"
                                    class="mb-4"
                                ></v-switch>
                                
                                <v-switch 
                                    v-model="config.visitorSettings.enableSelfCheckIn"
                                    label="Enable self-service check-in kiosk"
                                    hint="Allow visitors to check in via QR code at entry gates"
                                    persistent-hint
                                    color="blue"
                                    class="mb-4"
                                ></v-switch>

                                <v-switch 
                                    v-model="config.visitorSettings.enablePhotoCapture"
                                    label="Capture visitor photos on check-in"
                                    hint="Security enhancement - photos stored with check-in record"
                                    persistent-hint
                                    color="blue"
                                    class="mb-6"
                                ></v-switch>

                                <v-divider class="my-6"></v-divider>

                                <v-text-field
                                    v-model="config.visitorSettings.entryGates"
                                    label="Entry Gates"
                                    hint="Comma-separated list: Main Gate, Side Entrance, Back Door"
                                    persistent-hint
                                    variant="outlined"
                                    prepend-inner-icon="mdi-gate"
                                    class="mb-6"
                                ></v-text-field>
                                
                                <v-select
                                    v-model="config.visitorSettings.notificationMethod"
                                    :items="['SMS', 'Email', 'Both', 'None']"
                                    label="Host Notification Method"
                                    hint="How to notify hosts when their visitors arrive"
                                    persistent-hint
                                    variant="outlined"
                                    prepend-inner-icon="mdi-bell"
                                    class="mb-6"
                                ></v-select>

                                <v-text-field
                                    v-model.number="config.visitorSettings.maxVisitDuration"
                                    label="Maximum Visit Duration (minutes)"
                                    hint="Auto-notify security if visitor exceeds this duration"
                                    persistent-hint
                                    type="number"
                                    variant="outlined"
                                    prepend-inner-icon="mdi-clock"
                                    suffix="minutes"
                                    class="mb-6"
                                ></v-text-field>
                                
                                <v-textarea
                                    v-model="config.visitorSettings.welcomeMessage"
                                    label="Welcome Message"
                                    hint="Message shown to visitors on successful check-in"
                                    persistent-hint
                                    variant="outlined"
                                    rows="3"
                                    prepend-inner-icon="mdi-message-text"
                                    placeholder="Welcome to Downtown Gym! Please proceed to the reception."
                                ></v-textarea>
                            </v-card-text>
                        </v-card>



                        <!-- PAID ENTRY CONFIGURATION -->
                        <v-card class="mb-4" elevation="3">
                            <v-card-title class="pa-6 bg-grey-lighten-5">
                                <v-icon class="mr-2" color="green">mdi-cash-register</v-icon>
                                <span class="text-h6 font-weight-bold">Paid Visitor Access</span>
                            </v-card-title>
                            <v-card-text class="pa-6">
                                <v-switch 
                                    v-model="config.visitorSettings.enablePaidEntry"
                                    label="Enable Payment for Visitor Entry"
                                    hint="Charge visitors for entry passes (e.g. Day Pass, Event Ticket)"
                                    persistent-hint
                                    color="green"
                                    class="mb-4"
                                ></v-switch>

                                <v-slide-y-transition>
                                    <div v-if="config.visitorSettings.enablePaidEntry">
                                        <v-row>
                                            <v-col cols="12" md="6">
                                                <v-text-field
                                                    v-model.number="config.visitorSettings.entryFee"
                                                    label="Entry Fee Amount"
                                                    type="number"
                                                    prefix="₹"
                                                    variant="outlined"
                                                    density="comfortable"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-select
                                                    v-model="config.visitorSettings.paymentGateway"
                                                    :items="['Stripe', 'Razorpay', 'PayPal', 'Cash on Desk']"
                                                    label="Payment Gateway"
                                                    variant="outlined"
                                                    density="comfortable"
                                                ></v-select>
                                            </v-col>
                                        </v-row>
                                        <v-checkbox 
                                            v-model="config.visitorSettings.collectTax" 
                                            label="Collect GST/Tax on Entry Fee"
                                            density="compact"
                                            hide-details
                                        ></v-checkbox>
                                    </div>
                                </v-slide-y-transition>
                            </v-card-text>
                        </v-card>

                        <!-- BADGE DESIGNER -->
                        <v-card class="mb-4" elevation="3">
                            <v-card-title class="pa-6 bg-grey-lighten-5">
                                <v-icon class="mr-2" color="purple">mdi-card-account-details-outline</v-icon>
                                <span class="text-h6 font-weight-bold">Visitor Badge Template</span>
                            </v-card-title>
                            <v-card-text class="pa-6">
                                <v-row>
                                    <!-- Configuration -->
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="config.visitorSettings.badgeTitle"
                                            label="Badge Title"
                                            placeholder="VISITOR PASS"
                                            variant="outlined"
                                            density="compact"
                                            class="mb-4"
                                        ></v-text-field>

                                        <v-file-input
                                            label="Custom Logo (Event/Location)"
                                            prepend-icon="mdi-camera"
                                            variant="outlined"
                                            density="compact"
                                            accept="image/*"
                                            hint="Overrides global app logo"
                                            persistent-hint
                                            class="mb-4"
                                        ></v-file-input>

                                        <div class="text-subtitle-2 mb-2">Visible Fields</div>
                                        <v-checkbox v-model="config.visitorSettings.showWifi" label="Show WiFi Code" hide-details density="compact"></v-checkbox>
                                        <v-checkbox v-model="config.visitorSettings.showHost" label="Show Host Name" hide-details density="compact"></v-checkbox>
                                        <v-checkbox v-model="config.visitorSettings.showValidDate" label="Show Validity Date" hide-details density="compact"></v-checkbox>
                                        
                                        <v-text-field
                                            v-model="config.visitorSettings.badgeFooter"
                                            label="Footer Text"
                                            placeholder="Please return to reception"
                                            variant="outlined"
                                            density="compact"
                                            class="mt-4"
                                        ></v-text-field>
                                    </v-col>

                                    <!-- Live Preview -->
                                    <v-col cols="12" md="6">
                                        <div class="text-subtitle-2 text-center text-grey mb-2">Live Preview</div>
                                        <v-sheet border rounded elevation="2" class="mx-auto pa-4 text-center" width="250" height="380">
                                            <!-- Header -->
                                            <div class="d-flex justify-space-between align-center mb-4">
                                                <v-avatar size="32" color="primary" rounded>
                                                    <span class="text-white text-caption font-weight-bold">LG</span>
                                                </v-avatar>
                                                <div class="text-caption font-weight-bold">{{ config.visitorSettings.badgeTitle || 'VISITOR' }}</div>
                                            </div>

                                            <!-- Photo Placeholder -->
                                            <v-sheet color="grey-lighten-3" height="120" width="120" class="mx-auto mb-4 d-flex align-center justify-center rounded-circle">
                                                <v-icon size="64" color="grey-lighten-1">mdi-account</v-icon>
                                            </v-sheet>

                                            <!-- Name -->
                                            <div class="text-h6 font-weight-bold mb-1">John Doe</div>
                                            <div class="text-caption text-grey mb-3">Acme Corp</div>

                                            <!-- QR Code -->
                                            <v-icon size="80" class="mb-2">mdi-qrcode</v-icon>

                                            <!-- Details -->
                                            <div class="text-caption text-left mt-2 pl-2">
                                                <div v-if="config.visitorSettings.showHost"><strong>Host:</strong> Jane Smith</div>
                                                <div v-if="config.visitorSettings.showValidDate"><strong>Valid:</strong> Oct 24, 2026</div>
                                                <div v-if="config.visitorSettings.showWifi" class="mt-1 text-blue"><strong>WiFi:</strong> Guest / 1234</div>
                                            </div>

                                            <!-- Footer -->
                                            <div class="text-caption text-grey mt-4" style="font-size: 0.6rem !important;">
                                                {{ config.visitorSettings.badgeFooter }}
                                            </div>
                                        </v-sheet>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-card elevation="2" class="mb-4">
                            <v-card-title class="text-body-1 pa-4">
                                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                                Visitor Settings Info
                            </v-card-title>
                            <v-card-text class="text-body-2">
                                <p class="mb-2"><strong>Pre-Approval:</strong> Hosts must approve visitors before they can check in</p>
                                <p class="mb-2"><strong>Self Check-In:</strong> Visitors scan QR codes at gates without staff intervention</p>
                                <p class="mb-2"><strong>Photo Capture:</strong> Enhances security by storing visitor photos</p>
                                <p><strong>Notifications:</strong> Automatically alert hosts when visitors arrive</p>
                            </v-card-text>
                        </v-card>

                        <v-card elevation="2">
                            <v-card-title class="text-body-1 pa-4">
                                <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
                                Current Status
                            </v-card-title>
                            <v-card-text>
                                <v-list density="compact">
                                    <v-list-item prepend-icon="mdi-gate">
                                        <v-list-item-title>Entry Gates</v-list-item-title>
                                        <v-list-item-subtitle>{{ config.visitorSettings.entryGates.split(',').length }} configured</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item prepend-icon="mdi-shield-check">
                                        <v-list-item-title>Pre-Approval</v-list-item-title>
                                        <v-list-item-subtitle>{{ config.visitorSettings.requirePreApproval ? 'Enabled' : 'Disabled' }}</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </div>
        </v-window-item>

        <!-- TAB: Parking Settings -->
        <v-window-item v-if="config.modules.parking" value="parking-settings">
        <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
            <v-row>
                <v-col cols="12" md="8">
                    <!-- Template Manager -->
                    <v-card class="mb-6 elevation-2">
                        <v-card-title class="pa-4 bg-indigo-lighten-5 d-flex align-center justify-space-between">
                            <div class="d-flex align-center">
                                <v-icon color="indigo" class="mr-2">mdi-car-settings</v-icon>
                                <div>
                                    <div class="text-h6 font-weight-bold">Parking Pass Templates</div>
                                    <div class="text-caption text-grey-darken-2">Create multiple pass types (Staff, Regular, VIP)</div>
                                </div>
                            </div>
                            <v-btn color="indigo" prepend-icon="mdi-plus" @click="openTemplateDialog('Parking')">
                                Add Parking Type
                            </v-btn>
                        </v-card-title>
                        <v-card-text class="pa-4">
                            <v-row v-if="parkingTemplates.length">
                                <v-col v-for="temp in parkingTemplates" :key="temp.id" cols="12" sm="6">
                                    <v-card variant="outlined" class="pa-4 border-dashed">
                                        <div class="d-flex justify-space-between align-start mb-2">
                                            <div class="text-subtitle-1 font-weight-bold">{{ temp.name }}</div>
                                            <div class="d-flex gap-1">
                                                <v-btn icon="mdi-pencil" size="x-small" variant="text" color="indigo" @click="openTemplateDialog('Parking', temp)"></v-btn>
                                                <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteTemplate(temp.id)"></v-btn>
                                            </div>
                                        </div>
                                        <div class="d-flex align-center mb-3">
                                            <v-chip size="x-small" color="indigo" class="mr-2">{{ temp.accessMode }}</v-chip>
                                            <v-chip size="x-small" color="success" v-if="temp.membershipPlanId">
                                                <v-icon start size="12">mdi-tag</v-icon>
                                                {{ membershipPlansList.find(p => p.id === temp.membershipPlanId)?.name || 'Tagged Plan' }}
                                            </v-chip>
                                        </div>
                                        <div class="text-caption text-grey">Linked Access: {{ temp.membershipPlanId ? 'Membership Level' : 'Standard Pass' }}</div>
                                    </v-card>
                                </v-col>
                            </v-row>
                            <div v-else class="text-center pa-8 border-dashed rounded-lg bg-grey-lighten-4">
                                <v-icon size="48" color="grey-lighten-1">mdi-car-multiple</v-icon>
                                <div class="text-subtitle-1 text-grey-darken-1 mt-2">No templates configured</div>
                                <v-btn variant="text" color="indigo" size="small" @click="openTemplateDialog('Parking')">Create your first pass</v-btn>
                            </div>
                        </v-card-text>
                    </v-card>

                    <v-card class="mb-4" elevation="3">
                        <v-card-title class="pa-4 bg-grey-lighten-5">
                            <v-icon class="mr-2" color="indigo">mdi-car-cog</v-icon>
                            <span class="text-h6 font-weight-bold">Global Parking Rules</span>
                        </v-card-title>
                        <v-card-text class="pa-6">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model.number="config.parkingSettings.totalSlots"
                                        label="Total Parking Slots"
                                        hint="Total parking capacity"
                                        persistent-hint
                                        type="number"
                                        variant="outlined"
                                        prepend-inner-icon="mdi-parking"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model.number="config.parkingSettings.premiumSlots"
                                        label="Premium Slots"
                                        hint="Reserved for premium members"
                                        persistent-hint
                                        type="number"
                                        variant="outlined"
                                        prepend-inner-icon="mdi-star"
                                        :rules="[v => v <= config.parkingSettings.totalSlots || 'Cannot exceed total slots']"
                                    ></v-text-field>
                                </v-col>
                            </v-row>

                            <v-divider class="my-6"></v-divider>

                            <h3 class="text-h6 mb-4">Slot Numbering</h3>
                            <v-select
                                v-model="config.parkingSettings.slotNumbering"
                                :items="['A1-A100', 'P001-P100', 'L1-L100', 'Custom']"
                                label="Slot Numbering Format"
                                hint="How parking slots are numbered"
                                persistent-hint
                                variant="outlined"
                                prepend-inner-icon="mdi-numeric"
                                class="mb-6"
                            ></v-select>

                            <v-divider class="my-6"></v-divider>

                            <h3 class="text-h6 mb-4">Pricing</h3>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model.number="config.parkingSettings.regularRate"
                                        label="Hourly Rate (Regular Slots)"
                                        prefix="₹"
                                        type="number"
                                        variant="outlined"
                                        prepend-inner-icon="mdi-currency-inr"
                                        hint="Per hour charge"
                                        persistent-hint
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field
                                        v-model.number="config.parkingSettings.premiumRate"
                                        label="Hourly Rate (Premium Slots)"
                                        prefix="₹"
                                        type="number"
                                        variant="outlined"
                                        prepend-inner-icon="mdi-star-circle"
                                        hint="Per hour charge for premium"
                                        persistent-hint
                                    ></v-text-field>
                                </v-col>
                            </v-row>

                            <v-text-field
                                v-model.number="config.parkingSettings.maxParkingDuration"
                                label="Maximum Parking Duration"
                                suffix="hours"
                                type="number"
                                variant="outlined"
                                prepend-inner-icon="mdi-timer"
                                hint="Maximum allowed parking time (24 hours = 1 day)"
                                persistent-hint
                                class="mt-4"
                            ></v-text-field>

                            <v-divider class="my-6"></v-divider>

                            <h3 class="text-h6 mb-4">Advanced Features</h3>
                            <v-switch 
                                v-model="config.parkingSettings.automatedBarrier"
                                label="Enable automated barrier system"
                                hint="Integrate with automated gate control"
                                persistent-hint
                                color="indigo"
                                class="mb-4"
                            ></v-switch>

                            <v-switch 
                                v-model="config.parkingSettings.enableReservations"
                                label="Allow slot reservations"
                                hint="Users can book parking slots in advance"
                                persistent-hint
                                color="indigo"
                            ></v-switch>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card elevation="2" class="mb-4">
                        <v-card-title class="text-body-1 pa-4">
                            <v-icon class="mr-2" color="indigo">mdi-calculator</v-icon>
                            Capacity Summary
                        </v-card-title>
                        <v-card-text>
                            <div class="mb-4">
                                <div class="text-caption text-grey mb-1">Total Slots</div>
                                <div class="text-h4 font-weight-bold text-indigo">{{ config.parkingSettings.totalSlots }}</div>
                            </div>
                            <div class="mb-4">
                                <div class="text-caption text-grey mb-1">Premium</div>
                                <div class="text-h5 font-weight-bold text-purple">{{ config.parkingSettings.premiumSlots }}</div>
                            </div>
                            <div>
                                <div class="text-caption text-grey mb-1">Regular</div>
                                <div class="text-h5 font-weight-bold text-blue">{{ config.parkingSettings.totalSlots - config.parkingSettings.premiumSlots }}</div>
                            </div>
                        </v-card-text>
                    </v-card>

                    <v-card elevation="2">
                        <v-card-title class="text-body-1 pa-4">
                            <v-icon class="mr-2" color="success">mdi-cash</v-icon>
                            Revenue Estimate
                        </v-card-title>
                        <v-card-text>
                            <div class="text-caption text-grey mb-1">If fully occupied for 8 hours</div>
                            <div class="text-h4 font-weight-bold text-success">
                                ₹{{ ((config.parkingSettings.totalSlots - config.parkingSettings.premiumSlots) * config.parkingSettings.regularRate * 8 + 
                                     config.parkingSettings.premiumSlots * config.parkingSettings.premiumRate * 8).toLocaleString() }}
                            </div>
                            <div class="text-caption text-grey mt-2">Daily potential revenue</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        </v-window-item>



        <!-- TAB 2: Custom Domain -->
        <v-window-item value="domain">
        <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
            <v-row>
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title>Connect Your Domain</v-card-title>
                        <v-card-text>
                            <p class="mb-4">Use a custom domain (e.g., <code>visitor.yourcompany.com</code>) for your app. Requires CNAME verification.</p>
                            
                            <v-text-field 
                                v-model="domainConfig.domain"
                                label="Custom Domain" 
                                placeholder="app.mycompany.com" 
                                variant="outlined"
                                :disabled="domainConfig.status === 'active'"
                            >
                                <template v-slot:append>
                                    <v-btn v-if="domainConfig.status !== 'active'" color="primary" @click="registerDomain" :loading="verifyingDomain">Verify Connection</v-btn>
                                    <v-chip v-else color="success" prepend-icon="mdi-check">Connected</v-chip>
                                </template>
                            </v-text-field>

                            <v-expand-transition>
                                <div v-if="domainConfig.status === 'pending_verification'" class="bg-grey-lighten-4 pa-4 rounded border">
                                    <div class="d-flex align-center mb-2">
                                        <v-icon color="warning" class="mr-2">mdi-alert</v-icon> 
                                        <strong>DNS Configuration Required</strong>
                                    </div>
                                    <p class="text-body-2 mb-2">Log in to your DNS provider (GoDaddy, Cloudflare, etc.) and add the following CNAME record:</p>
                                    
                                    <v-table density="compact">
                                        <thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead>
                                        <tbody>
                                            <tr><td>CNAME</td><td>{{ domainConfig.domain }}</td><td><code>{{ domainConfig.cname }}</code></td></tr>
                                        </tbody>
                                    </v-table>
                                    
                                    <div class="mt-4">
                                        <v-btn variant="text" size="small" color="primary" @click="verifyDns" :loading="verifyingDns">Check Status Again</v-btn>
                                    </div>
                                </div>
                            </v-expand-transition>

                             <v-alert v-if="domainConfig.status === 'active'" type="success" variant="tonal" class="mt-4">
                                <strong>Setup Complete!</strong><br>
                                Your app is live at <a :href="`https://${domainConfig.domain}`" target="_blank">{{ domainConfig.domain }}</a>. SSL is active.
                                <div class="mt-1 text-caption text-grey">Provider: {{ domainConfig.provider }}</div>
                            </v-alert>

                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        </v-window-item>

        <!-- TAB 3: Advanced Wallet -->
        <v-window-item v-if="config.modules.wallet" value="wallet">
        <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
            <v-row>
                <v-col cols="12" md="8">
                    <v-alert icon="mdi-wallet-giftcard" color="purple-lighten-5" class="mb-4 text-purple-darken-2" border="start" border-color="purple">
                        Configure how employees receive and use their digital credits.
                    </v-alert>
                    
                    <v-card class="mb-4">
                         <v-card-title>Monthly Allowance Rules</v-card-title>
                         <v-card-text>
                            <v-radio-group v-model="config.walletRules.allowanceType">
                                <v-radio value="none" label="No Automatic Allowance (Manual Top-up only)"></v-radio>
                                <v-radio value="fixed" label="Fixed Monthly Allowance (e.g. ₹2000/mo)"></v-radio>
                                <v-radio value="department" label="Department-based Budgeting (HR, Tech, Sales)"></v-radio>
                            </v-radio-group>

                             <v-expand-transition>
                                <div v-if="config.walletRules.allowanceType === 'fixed'" class="pl-4 ml-2 border-l-4">
                                    <v-text-field 
                                        v-model.number="config.walletRules.monthlyPoints" 
                                        label="Amount per Employee" 
                                        prefix="₹" 
                                        type="number"
                                        variant="outlined"
                                    ></v-text-field>
                                </div>
                            </v-expand-transition>
                         </v-card-text>
                    </v-card>

                     <v-card>
                         <v-card-title>Expiration & Carry Forward</v-card-title>
                         <v-card-text>
                            <v-checkbox v-model="config.walletRules.carryForward" label="Allow unused balance to carry forward to next month" hide-details></v-checkbox>
                            
                            <v-expand-transition>
                                <div v-if="config.walletRules.carryForward" class="pl-4 ml-2 border-l-4 mt-2">
                                    <v-text-field 
                                        v-model.number="config.walletRules.maxCap" 
                                        label="Maximum Balance Cap (Safety Limit)" 
                                        prefix="₹" 
                                        type="number"
                                        variant="outlined"
                                    ></v-text-field>
                                </div>
                            </v-expand-transition>

                            <v-checkbox v-model="config.walletRules.resetUnused" label="Reset balance to zero on 1st of month" v-if="!config.walletRules.carryForward"></v-checkbox>
                         </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        </v-window-item>

        <!-- TAB 4: Plan & Billing -->
        <v-window-item v-if="config.modules.membership" value="plan">
        <div style="max-height: 70vh; overflow-y: auto; overflow-x: hidden;" class="pa-1">
            <v-card elevation="0" border>
                <div class="d-flex align-center justify-space-between pa-4 bg-grey-lighten-5 border-bottom">
                    <div>
                        <h3 class="text-h6 font-weight-bold">Membership & Access Plans</h3>
                        <p class="text-caption text-grey-darken-1 mb-0">Define the memberships and passes available for sale at this location</p>
                    </div>
                </div>
                <div class="pa-4">
                     <AccessLevelManager 
                        :embedded="true" 
                        :place-id="placeId" 
                        :visitor-settings="config.visitorSettings"
                        :parking-settings="config.parkingSettings"
                     />
                </div>
            </v-card>
        </div>
        </v-window-item>
    </v-window>
    </v-card>

    <!-- Template Dialog -->
    <v-dialog v-model="showTemplateDialog" max-width="500">
        <v-card>
            <v-card-title class="pa-4 bg-primary text-white">
                {{ editingTemplate ? 'Edit' : 'Create' }} {{ currentTemplate.type }} Template
            </v-card-title>
            <v-card-text class="pa-4">
                <v-text-field v-model="currentTemplate.name" label="Type Name (e.g. Regular, Contractor, Special)" variant="outlined" class="mb-4"></v-text-field>
                
                <v-select
                    v-model="currentTemplate.accessMode"
                    :items="['Security Check', 'Auto Entry', 'QR Only']"
                    label="Access Logic"
                    variant="outlined"
                    class="mb-4"
                ></v-select>

                <div class="text-subtitle-2 mb-2 font-weight-bold">
                    <v-icon color="success" size="small" class="mr-1">mdi-tag-multiple</v-icon>
                    Linked Membership Plan (Access Level)
                </div>
                <div class="text-caption text-grey mb-2">Tagging a plan grants the user those specific permissions upon entry.</div>
                <v-select
                    v-model="currentTemplate.membershipPlanId"
                    :items="membershipPlansList"
                    item-title="name"
                    item-value="id"
                    label="Select Membership Plan to Link"
                    variant="outlined"
                    clearable
                ></v-select>
            </v-card-text>
            <v-card-actions class="pa-4 pt-0">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="showTemplateDialog = false">Cancel</v-btn>
                <v-btn color="primary" variant="flat" @click="saveTemplate">Save Template</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

  </div>

  <div v-else class="text-center mt-12">
    <v-icon size="64" color="grey-lighten-1">mdi-domain-off</v-icon>
    <h3 class="text-h6 text-grey mt-4">No Place Selected</h3>
    <p class="text-body-2 text-grey">Please select a place from the dropdown in the top bar to configure its storefront.</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { placesService } from '@/services/appLayer/placesService';
import { storefrontService } from '@/services/appLayer/storefrontService';
import { domainService } from '@/services/appLayer/domainService';
import AccessLevelManager from '@/pages/apps/places/AccessLevelManager.vue';
import { appState } from '@/store/appLayerState';
import BaseButton from '@/components/common/buttons/BaseButton.vue';

const route = useRoute();
const saving = ref(false);
const placeId = ref(null);
const activeTab = ref('branding');
const verifyingDomain = ref(false);
const verifyingDns = ref(false);
const hasUnsavedChanges = ref(false);
const logoInput = ref(null);

// Multi-Template Management
import { passTemplateService } from '@/services/appLayer/passTemplateService';
import { accessLevelService } from '@/services/appLayer/accessLevelService';

const visitorTemplates = ref([]);
const parkingTemplates = ref([]);
const membershipPlansList = ref([]);
const showTemplateDialog = ref(false);
const currentTemplate = ref({ name: '', type: 'Visitor', membershipPlanId: '' });
const editingTemplate = ref(false);

const logoGallery = [
    'https://cdn.vuetifyjs.com/images/logos/vuetify-logo-light.png',
    'https://vuetifyjs.com/apple-touch-icon-180x180.png',
    'https://randomuser.me/api/portraits/lego/1.jpg',
    'https://cdn.v1.access-easy.io/logos/ae_blue.png',
    'https://cdn.v1.access-easy.io/logos/ae_black.png'
];

const getValidatorUrl = (type) => {
  const baseUrl = window.location.origin;
  if (type === 'security') {
    return `${baseUrl}/apps/validator?placeId=${placeId.value}`;
  } else if (type === 'canteen') {
    return `${baseUrl}/apps/canteen/validator?placeId=${placeId.value}`;
  } else if (type === 'staff') {
    return `${baseUrl}/staff-portal`;
  }
  return '';
};

const loadTemplates = async () => {
    const all = await passTemplateService.getAll();
    visitorTemplates.value = all.filter(t => t.type === 'Visitor');
    parkingTemplates.value = all.filter(t => t.type === 'Parking');
};

const loadMembershipPlans = async () => {
    membershipPlansList.value = await accessLevelService.getAll();
};

const openTemplateDialog = (type, template = null) => {
    editingTemplate.value = !!template;
    currentTemplate.value = template ? { ...template } : { name: '', type, membershipPlanId: '' };
    showTemplateDialog.value = true;
};

const saveTemplate = async () => {
    if (editingTemplate.value) {
        await passTemplateService.update(currentTemplate.value.id, currentTemplate.value);
    } else {
        await passTemplateService.create(currentTemplate.value);
    }
    showTemplateDialog.value = false;
    await loadTemplates();
};

const deleteTemplate = async (id) => {
    await passTemplateService.delete(id);
    await loadTemplates();
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    alert('Failed to copy');
  }
};

const triggerLogoUpload = () => {
    logoInput.value.click();
};

const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        config.value.logoUrl = event.target.result;
    };
    reader.readAsDataURL(file);
};

const domainConfig = ref({
    domain: '',
    status: 'none', // none, pending_verification, active
    cname: '',
    provider: ''
});

const config = ref({
    appName: 'My App',
    theme: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        background: '#FFFFFF',
        surface: '#FFFFFF'
    },
    logoUrl: '',
    modules: {
        visitor: true,
        parking: true,
        canteen: true,
        security: true,
        membership: true,
        wallet: true
    },
    visitorSettings: {
        requirePreApproval: false,
        enableSelfCheckIn: true,
        enablePhotoCapture: false,
        entryGates: 'Main Gate, Side Entrance',
        enablePaidEntry: false,
        entryFee: 100,
        paymentGateway: 'Razorpay',
        collectTax: false,
        badgeTitle: 'VISITOR PASS',
        showWifi: true,
        showHost: true,
        showValidDate: true,
        badgeFooter: 'Please return to reception',
        notificationMethod: 'SMS',
        maxVisitDuration: 480,
        welcomeMessage: 'Welcome! Please proceed to reception.'
    },
    parkingSettings: {
        totalSlots: 100,
        premiumSlots: 20,
        slotNumbering: 'A1-A100',
        regularRate: 20,
        premiumRate: 30,
        maxParkingDuration: 24,
        automatedBarrier: false,
        enableReservations: false
    },
    walletRules: {
        allowanceType: 'none',
        monthlyPoints: 0,
        carryForward: false,
        maxCap: 5000,
        resetUnused: false,
        autoRenewal: false
    },
    canteenSettings: {
        canteenName: 'Main Canteen',
        allowPreOrder: true,
        enableWalletPayments: true,
        categories: ['Main Course', 'Snacks', 'Beverages', 'Desserts'],
        operationalHours: '08:00 AM - 08:00 PM'
    }
});

const plans = [
    { name: 'Starter', price: 0, features: ['Visitor Management', 'Standard Branding', '100 Active Users'] },
    { name: 'Pro', price: 4999, features: ['Visitor + Parking', 'Custom Domain', 'Wallet System', '1000 Active Users'] },
    { name: 'Enterprise', price: 14999, features: ['All Modules', 'SSO Integration', 'Unlimited Users', 'Dedicated Support', 'SLA'] }
];

onMounted(async () => {
    // Check URL query param first (from Admin Dashboard), else use Global State
    if (route.query.placeId) {
        placeId.value = route.query.placeId;
    } else if (appState.selectedPlaceId) {
        placeId.value = appState.selectedPlaceId;
    } else {
        // Default for demo/standalone access
        placeId.value = 1;
    }

    if (placeId.value) {
        await loadConfig();
        await loadDomain();
        await loadTemplates();
        await loadMembershipPlans();
    }
});

const loadConfig = async () => {
    try {
        const data = await storefrontService.getConfig(placeId.value);
        if (!data) return;

        // Legacy mapping
        if (data.brandColor && !data.theme) {
            data.theme = { ...config.value.theme, primary: data.brandColor };
        }

        // Deep merge top-level objects to preserve defaults for new sub-fields
        config.value = {
            ...config.value,
            ...data,
            theme: { ...config.value.theme, ...(data.theme || {}) },
            modules: { ...config.value.modules, ...(data.modules || {}) },
            visitorSettings: { ...config.value.visitorSettings, ...(data.visitorSettings || {}) },
            parkingSettings: { ...config.value.parkingSettings, ...(data.parkingSettings || {}) },
            canteenSettings: { ...config.value.canteenSettings, ...(data.canteenSettings || {}) },
            walletRules: { ...config.value.walletRules, ...(data.walletRules || {}) }
        };
    } catch (e) { console.error(e); }
};

const loadDomain = async () => {
    try {
        const d = await domainService.getDomain(placeId.value);
        if (d) domainConfig.value = d;
    } catch (e) {}
};

const registerDomain = async () => {
    if (!domainConfig.value.domain) return;
    verifyingDomain.value = true;
    try {
        domainConfig.value = await domainService.registerDomain(placeId.value, domainConfig.value.domain);
    } catch(e) { alert(e.message); }
    finally { verifyingDomain.value = false; }
};

const verifyDns = async () => {
    verifyingDns.value = true;
    try {
        domainConfig.value = await domainService.verifyDns(placeId.value);
        alert('Domain Verified Successfully! SSL Cert issued.');
    } catch(e) { alert(e.message); }
    finally { verifyingDns.value = false; }
};

const save = async () => {
    saving.value = true;
    try {
        await storefrontService.saveConfig(placeId.value, config.value);
        alert('Configuration saved successfully!');
    } catch (e) { 
        console.error(e);
        alert('Error saving configuration: ' + e.message);
    }
    finally { saving.value = false; }
};
</script>

<style scoped>
.storefront-config {
  /* max-width: 1400px; */
  margin: 0 auto;
}

.config-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 2rem;
}

.phone-frame {
  width: 280px;
  height: 500px;
  border: 8px solid #333;
  border-radius: 24px !important;
  transition: all 0.3s ease;
}

.phone-frame:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

/* Custom tab styling - matching Employee section */
.custom-tabs {
  background-color: transparent;
  padding: 8px 0 8px;
  border-bottom: none;
  margin-bottom: 24px;
}

.custom-tab {
  border-radius: 8px;
  background-color: #fff;
  color: #64748b !important;
  border: 1px solid #e2e8f0;
  margin-right: 12px;
  min-height: 36px;
  height: 36px;
  transition: all 0.2s ease;
  text-transform: capitalize;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.3px;
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important;
  color: #ffffff !important;
  border-color: #122f68;
  box-shadow: 0 4px 12px rgba(18, 47, 104, 0.15);
  transform: translateY(-1px);
}

/* Icon styles */
.custom-tab .v-icon {
  color: #64748b !important;
  font-size: 18px;
  opacity: 1;
}
.v-tab--selected .v-icon {
  color: #ffffff !important;
}

/* Content below tabs */
.tab-content-wrapper {
  border-radius: 12px;
  background: white;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

::v-deep(.v-tab.v-btn) {
  height: 36px !important;
  border-radius: 8px !important;
  min-width: auto !important;
  padding: 0 16px;
}

/* Card enhancements */
:deep(.v-card) {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
</style>
