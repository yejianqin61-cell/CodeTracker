import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './i18n/index'

createApp(App).use(createPinia()).use(router).mount('#app')

