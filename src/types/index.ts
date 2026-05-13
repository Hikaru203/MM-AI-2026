export type Category = 'Ăn uống' | 'Cafe' | 'Di chuyển' | 'Shopping' | 'Công việc' | 'Giải trí' | 'Khác';

export type Wallet = {
  id: string;
  name: string;
  balance: number;
  type: string;
};

export type Mood = 'vui vẻ' | 'thư giãn' | 'sang chảnh' | 'tiết kiệm' | 'bận rộn' | 'buồn' | 'hối hận';

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  walletId: string;
  imageUrl?: string;
  note?: string;
  mood: Mood;
  location?: string;
  aiSummary?: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  avatarUrl?: string;
};
