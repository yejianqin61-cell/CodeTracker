import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import LogsView from '../views/LogsView.vue'
import HeatmapView from '../views/HeatmapView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardView },
    { path: '/logs', component: LogsView },
    { path: '/heatmap', component: HeatmapView },
    { path: '/statistics', component: StatisticsView },
    { path: '/settings', component: SettingsView },
  ],
})

export default router

