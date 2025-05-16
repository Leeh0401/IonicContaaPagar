import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { User, AuthResponse } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private readonly USER_STORAGE_KEY = 'currentUser';
  private readonly TOKEN_STORAGE_KEY = 'authToken';
  private readonly USERS_STORAGE_KEY = 'users';

  constructor(private storage: StorageService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.initializeCurrentUser();
  }

  private async initializeCurrentUser() {
    const user = await this.storage.get(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async register(user: User): Promise<AuthResponse> {
    try {
      // Verificar se o usuário já existe
      const users = await this.getAllUsers();
      if (users.some(u => u.email === user.email)) {
        return {
          success: false,
          message: 'Email já cadastrado',
          user: user,
          token: ''
        };
      }

      // Criar novo usuário
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: true
      };

      // Adicionar à lista de usuários
      users.push(newUser);
      await this.storage.set(this.USERS_STORAGE_KEY, users);

      // Gerar token (simulado)
      const token = this.generateToken();

      return {
        success: true,
        user: newUser,
        token: token,
        message: 'Registro realizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao registrar usuário',
        user: user,
        token: ''
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return {
          success: false,
          message: 'Credenciais inválidas',
          user: { email, name: '', password },
          token: ''
        };
      }

      // Atualizar último login
      user.lastLogin = new Date();
      await this.updateUser(user);

      // Gerar token
      const token = this.generateToken();

      // Salvar usuário atual e token
      await this.storage.set(this.USER_STORAGE_KEY, user);
      await this.storage.set(this.TOKEN_STORAGE_KEY, token);
      this.currentUserSubject.next(user);

      return {
        success: true,
        user: user,
        token: token,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao realizar login',
        user: { email, name: '', password },
        token: ''
      };
    }
  }

  async logout(): Promise<void> {
    await this.storage.remove(this.USER_STORAGE_KEY);
    await this.storage.remove(this.TOKEN_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  async updateUser(user: User): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const index = users.findIndex(u => u.id === user.id);
      
      if (index !== -1) {
        users[index] = user;
        await this.storage.set(this.USERS_STORAGE_KEY, users);
        
        // Se for o usuário atual, atualizar o currentUser
        if (this.currentUserValue?.id === user.id) {
          await this.storage.set(this.USER_STORAGE_KEY, user);
          this.currentUserSubject.next(user);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      await this.storage.set(this.USERS_STORAGE_KEY, filteredUsers);
      
      // Se for o usuário atual, fazer logout
      if (this.currentUserValue?.id === userId) {
        await this.logout();
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.storage.get(this.USERS_STORAGE_KEY);
    return users || [];
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.storage.get(this.TOKEN_STORAGE_KEY);
    return !!token;
  }

  private generateToken(): string {
    // Simulação simples de token - em produção, use um método mais seguro
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
