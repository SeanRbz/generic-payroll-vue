import { createApp } from 'vue'

import App from './App.vue'
import { createAppRouter } from './router'
import './assets/styles/main.css'

createApp(App).use(createAppRouter()).mount('#app')
