import { Transaction } from '@/core/models/transaction.model';

export type TransactionSection = {
  title: string;
  data: Transaction[];
};

// Agrupa preservando el orden de aparición (los datos ya vienen ordenados por fecha
// descendente desde DataService), para alimentar una SectionList con headers sticky.
export function groupTransactionsByDay(transactions: Transaction[]): TransactionSection[] {
  const sections: TransactionSection[] = [];

  for (const transaction of transactions) {
    const lastSection = sections[sections.length - 1];
    if (lastSection && lastSection.title === transaction.day) {
      lastSection.data.push(transaction);
    } else {
      sections.push({ title: transaction.day, data: [transaction] });
    }
  }

  return sections;
}
