import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContasAPagarPage } from './contas-a-pagar.page';

describe('ContasAPagarPage', () => {
  let component: ContasAPagarPage;
  let fixture: ComponentFixture<ContasAPagarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContasAPagarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
