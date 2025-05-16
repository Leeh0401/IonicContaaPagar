import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ContasService } from '../../services/contas.service';
import { Conta } from '../../models/conta.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contas-a-pagar',
  templateUrl: './contas-a-pagar.page.html',
  styleUrls: ['./contas-a-pagar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
})
export class ContasAPagarPage implements OnInit {
  contaForm: FormGroup;
  contas: Conta[] = [];
  userName: string = '';
  resumoFinanceiro = {
    total: 0,
    pagas: 0,
    pendentes: 0,
    atrasadas: 0
  };

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private contasService: ContasService,
    private authService: AuthService,
    private router: Router
  ) {
    this.contaForm = this.fb.group({
      descricao: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      dataVencimento: ['', Validators.required],
      categoria: ['', Validators.required],
      observacoes: ['']
    });
  }

  async ngOnInit() {
    const isAuth = await this.authService.isAuthenticated();

    if (!isAuth) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userName = currentUser.name;
    }

    await this.carregarContas();
    await this.carregarResumoFinanceiro();
  }

  async carregarContas() {
    try {
      this.contas = await this.contasService.getContasDoUsuario();
      await this.contasService.verificarContasAtrasadas();
    } catch (error) {
      this.presentAlert('Erro', 'Erro ao carregar contas.');
    }
  }

  async carregarResumoFinanceiro() {
    try {
      this.resumoFinanceiro = await this.contasService.getResumoFinanceiro();
    } catch (error) {
      this.presentAlert('Erro', 'Erro ao carregar resumo financeiro.');
    }
  }

  async adicionarConta() {
    if (!this.contaForm.valid) {
      this.presentAlert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }

    try {
      const novaConta = await this.contasService.criarConta({
        descricao: this.contaForm.value.descricao,
        valor: Number(this.contaForm.value.valor),
        dataVencimento: new Date(this.contaForm.value.dataVencimento),
        categoria: this.contaForm.value.categoria,
        observacoes: this.contaForm.value.observacoes
      });

      if (novaConta) {
        this.contaForm.reset();
        await this.carregarContas();
        await this.carregarResumoFinanceiro();
        this.presentAlert('Sucesso', 'Conta adicionada com sucesso!');
      } else {
        this.presentAlert('Erro', 'Não foi possível adicionar a conta.');
      }
    } catch (error) {
      this.presentAlert('Erro', 'Ocorreu um erro ao adicionar a conta.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
