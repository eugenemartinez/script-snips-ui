import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import 'primeicons/primeicons.css';
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { MotionPlugin } from '@vueuse/motion';


const app = createApp(App)

// Use the router
app.use(router)

// Configure and use vue-toastification
const options: PluginOptions = {
    // You can set your default options here
    position: POSITION.TOP_RIGHT,
    timeout: 5000, // 5 seconds
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};
app.use(Toast, options);
app.use(MotionPlugin);

app.mount('#app')
