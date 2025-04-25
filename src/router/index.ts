import { createRouter, createWebHistory } from 'vue-router';

// Import page components (we'll create these files next)
// Using dynamic imports for lazy loading
const HomePage = () => import('../views/HomePage.vue');
const ScriptsListPage = () => import('../views/ScriptsListPage.vue');
const ScriptDetailPage = () => import('../views/ScriptDetailPage.vue');
const SceneStashPage = () => import('../views/SceneStashPage.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/scripts',
    name: 'ScriptsList',
    component: ScriptsListPage,
  },
  {
    // Route for viewing a specific script by its ID
    path: '/scripts/:id', // ':id' is a route parameter
    name: 'ScriptDetail',
    component: ScriptDetailPage,
    props: true, // Pass route params as props to the component
  },
  {
    path: '/scene-stash',
    name: 'SceneStash',
    component: SceneStashPage,
  },
  // Optional: Add a 404 Not Found route
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'NotFound',
  //   component: () => import('../views/NotFoundPage.vue') // Create this component if needed
  // }
];

const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // short for `routes: routes`
});

export default router;