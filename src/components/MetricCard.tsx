'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
  iconColor?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  className, 
  iconColor = 'text-blue-600' 
}: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  'text-xs font-medium',
                  change.trend === 'up' && 'text-green-600',
                  change.trend === 'down' && 'text-red-600',
                  change.trend === 'neutral' && 'text-gray-600'
                )}>
                  {change.trend === 'up' && '↗'}
                  {change.trend === 'down' && '↘'}
                  {change.trend === 'neutral' && '→'}
                  {' '}{change.value}
                </span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <Icon className={cn('h-8 w-8', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
