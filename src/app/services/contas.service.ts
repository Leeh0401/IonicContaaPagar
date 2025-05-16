import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Conta, ContaFiltros } from '../models/conta.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContasService {
  private readonly CONTAS_STORAGE_KEY = 'contas';
  private contasSubject: BehaviorSubject<Conta[]>;
  public contas: Observable<Conta[]>;

  constructor(
    private storage: StorageService,
    private authService: AuthService
  ) {
    this.contasSubject = new BehaviorSubject<Conta[]>([]);
    this.contas = this.contasSubject.asObservable();
    this.loadContas();
  }

  private async loadContas() {
    try {
      const contas = await this.storage.get(this.CONTAS_STORAGE_KEY) || [];
      this.contasSubject.next(contas);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }

  async criarConta(conta: Omit<Conta, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Conta | null> {
    try {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const novaConta: Conta = {
        ...conta,
        id: Date.now().toString(),
        userId: currentUser.id!,
        status: 'pendente',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const contas = [...this.contasSubject.value, novaConta];
      await this.storage.set(this.CONTAS_STORAGE_KEY, contas);
      this.contasSubject.next(contas);
      
      return novaConta;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      return null;
    }
  }

  async atualizarConta(contaId: string, atualizacao: Partial<Conta>): Promise<boolean> {
    try {
      const contas = this.contasSubject.value;
      const index = contas.findIndex(c => c.id === contaId);
      
      if (index === -1) return false;

      const contaAtual = contas[index];
      const contaAtualizada: Conta = {
        ...contaAtual,
        ...atualizacao,
        updatedAt: new Date()
      };

      contas[index] = contaAtualizada;
      await this.storage.set(this.CONTAS_STORAGE_KEY, contas);
      this.contasSubject.next(contas);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      return false;
    }
  }

  async pagarConta(contaId: string): Promise<boolean> {
    return this.atualizarConta(contaId, {
      status: 'paga',
      dataPagamento: new Date()
    });
  }

  async deletarConta(contaId: string): Promise<boolean> {
    try {
      const contas = this.contasSubject.value.filter(c => c.id !== contaId);
      await this.storage.set(this.CONTAS_STORAGE_KEY, contas);
      this.contasSubject.next(contas);
      return true;
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      return false;
    }
  }

  async getContasDoUsuario(filtros?: ContaFiltros): Promise<Conta[]> {
    try {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) return [];

      let contas = this.contasSubject.value.filter(c => c.userId === currentUser.id);

      if (filtros) {
        contas = this.aplicarFiltros(contas, filtros);
      }

      return contas;
    } catch (error) {
      console.error('Erro ao buscar contas do usuário:', error);
      return [];
    }
  }

  async getContaPorId(contaId: string): Promise<Conta | null> {
    try {
      const conta = this.contasSubject.value.find(c => c.id === contaId);
      return conta || null;
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      return null;
    }
  }

  async verificarContasAtrasadas(): Promise<void> {
    try {
      const contas = this.contasSubject.value;
      const hoje = new Date();
      let atualizacaoNecessaria = false;

      contas.forEach(conta => {
        if (conta.status === 'pendente' && new Date(conta.dataVencimento) < hoje) {
          conta.status = 'atrasada';
          conta.updatedAt = new Date();
          atualizacaoNecessaria = true;
        }
      });

      if (atualizacaoNecessaria) {
        await this.storage.set(this.CONTAS_STORAGE_KEY, contas);
        this.contasSubject.next(contas);
      }
    } catch (error) {
      console.error('Erro ao verificar contas atrasadas:', error);
    }
  }

  private aplicarFiltros(contas: Conta[], filtros: ContaFiltros): Conta[] {
    return contas.filter(conta => {
      if (filtros.status && conta.status !== filtros.status) return false;
      if (filtros.categoria && conta.categoria !== filtros.categoria) return false;
      
      const dataVencimento = new Date(conta.dataVencimento);
      if (filtros.dataInicial && dataVencimento < filtros.dataInicial) return false;
      if (filtros.dataFinal && dataVencimento > filtros.dataFinal) return false;
      
      return true;
    });
  }

  async getCategorias(): Promise<string[]> {
    try {
      const contas = await this.getContasDoUsuario();
      const categorias = new Set(contas.map(c => c.categoria));
      return Array.from(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  async getResumoFinanceiro(): Promise<{
    total: number;
    pagas: number;
    pendentes: number;
    atrasadas: number;
  }> {
    try {
      const contas = await this.getContasDoUsuario();
      
      return contas.reduce((acc, conta) => {
        acc.total += conta.valor;
        
        switch (conta.status) {
          case 'paga':
            acc.pagas += conta.valor;
            break;
          case 'pendente':
            acc.pendentes += conta.valor;
            break;
          case 'atrasada':
            acc.atrasadas += conta.valor;
            break;
        }
        
        return acc;
      }, {
        total: 0,
        pagas: 0,
        pendentes: 0,
        atrasadas: 0
      });
    } catch (error) {
      console.error('Erro ao gerar resumo financeiro:', error);
      return {
        total: 0,
        pagas: 0,
        pendentes: 0,
        atrasadas: 0
      };
    }
  }
}
