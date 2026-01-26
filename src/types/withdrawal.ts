export interface WithdrawalRequest {
  amount: string;
  assetName: string;
  chainId: number;
  code: string;
  toAddress: string;
}

export interface WithdrawalResponse {
  message: string;
  orderId: number;
  status: number;
}

export interface WithdrawalFormData {
  amount: string;
  toAddress: string;
  verificationCode: string;
}

export interface UserBalance {
  availableAmount: string;
  totalIncome: string;
  assetName: string;
}

export interface WithdrawalConfig {
  minimumAmount: string;
  serviceFee: string;
  network: string;
  chainId: number;
  assetName: string;
}