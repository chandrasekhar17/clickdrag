import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseRouterComponent } from './base-router/base-router.component';
import { DesignComponent } from './design-preview-activity/design/design.component';
import { PreviewComponent } from './design-preview-activity/preview/preview.component';
import { TestComponent } from './test-review/test/test.component';
import { CheckMyWorkComponent } from './test-review/check-my-work/check-my-work.component';

const routes: Routes = [
  {
    path: 'design',
    component: DesignComponent,
    loadChildren: () => import('./design-preview-activity/design/design.module').then((m) => m.DesignModule),
  },
  {
    path: 'preview',
    component: PreviewComponent,
    loadChildren: () => import('./design-preview-activity/preview/preview.module').then((m) => m.PreviewModule),
  },
  {
    path: 'review',
    component: CheckMyWorkComponent,
    loadChildren: () =>
      import('../app/test-review/check-my-work/check-my-work.module').then((m) => m.CheckMyWorkModule),
  },
  {
    path: 'test',
    component: TestComponent,
    loadChildren: () => import('../app/test-review/test/test.module').then((m) => m.TestModule),
  },
  {
    path: 'sample',
    component: CheckMyWorkComponent,
    loadChildren: () =>
      import('../app/test-review/check-my-work/check-my-work.module').then((m) => m.CheckMyWorkModule),
  },
  {
    path: 'route',
    component: BaseRouterComponent,
    loadChildren: () => import('../app/base-router/base-router.module').then((m) => m.BaseRouterModule),
  },
  {
    path: '**',
    redirectTo: 'route',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
