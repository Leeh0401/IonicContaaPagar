export interface Conta {
  id: string;
  userId: string;  
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'paga' | 'atrasada';
  categoria: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContaFiltros {
  status?: 'pendente' | 'paga' | 'atrasada';
  categoria?: string;
  dataInicial?: Date;
  dataFinal?: Date;
} 
