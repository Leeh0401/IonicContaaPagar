import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContasAPagarPage } from './contas-a-pagar.page';

const routes: Routes = [
  {
    path: '',
    component: ContasAPagarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContasAPagarPageRoutingModule {}
