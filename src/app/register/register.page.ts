import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup = new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');
    
    if (password && confirmPassword) {
      return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
    }
    
    return null;
  }

  async register() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      
      try {
        const newUser: User = {
          name,
          email,
          password
        };

        const response = await this.authService.register(newUser);
        
        if (response.success) {
          this.presentSuccessAlert();
        } else {
          this.presentAlert('Erro', response.message || 'Erro ao realizar o cadastro');
        }
      } catch (error) {
        this.presentAlert('Erro', 'Ocorreu um erro ao tentar realizar o cadastro. Tente novamente.');
      }
    } else {
      if (this.registerForm.hasError('passwordMismatch')) {
        this.presentAlert('Erro', 'As senhas não coincidem.');
      } else {
        this.presentAlert('Erro', 'Por favor, preencha todos os campos corretamente.');
      }
    }
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Sucesso',
      message: 'Cadastro realizado com sucesso!',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/login']);
        }
      }]
    });

    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}