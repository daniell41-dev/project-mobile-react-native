export type NotificationIcon = 'payment' | 'security' | 'goal' | 'statement';

export type AppNotification = {
  id: string;
  icon: NotificationIcon;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};
