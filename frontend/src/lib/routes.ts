import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';
import HomePage from './pages/home/HomePage';


const customersRoutes: RouteDefinition<any>[] = [
  // {
  //   path: '/customers-list',
  //   component: lazy(() => import('./pages/customers/CustomerListPage')),
  // },
];


export const routes: RouteDefinition<any>[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/home/HomePage')),
  }
];

