import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: 'primary' | 'accent' | 'success' | 'warning';
  subtitle?: string;
}

const gradientClasses = {
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  success: 'gradient-success',
  warning: 'gradient-warning',
};

export const StatCard = ({ title, value, icon: Icon, gradient, subtitle }: StatCardProps) => {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-display font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${gradientClasses[gradient]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
