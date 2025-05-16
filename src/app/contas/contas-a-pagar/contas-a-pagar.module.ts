import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContasAPagarPage } from './contas-a-pagar.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContasAPagarPage,
    RouterModule.forChild([
      {
        path: '',
        component: ContasAPagarPage
      }
    ])
  ]
})
export class ContasAPagarPageModule {}
