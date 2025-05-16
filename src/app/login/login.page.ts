import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      
      try {
        const response = await this.authService.login(email, password);
        
        if (response.success) {
          console.log('Login realizado com sucesso');
          this.router.navigate(['/contas-a-pagar']);
        } else {
          this.presentAlert('Erro', response.message || 'Credenciais inválidas');
        }
      } catch (error) {
        this.presentAlert('Erro', 'Ocorreu um erro ao tentar fazer login. Tente novamente.');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.presentAlert('Erro', 'Por favor, preencha todos os campos corretamente.');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
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