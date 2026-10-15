import React from 'react';
import {
  GraduationCap,
  FlaskConical,
  Bus,
  Utensils,
  Building2,
  Droplet,
  Sparkles,
  CreditCard,
  BookOpen,
  Wifi,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { ComplaintCategory } from '../types';

export const CategoryIcon: React.FC<{
  category: ComplaintCategory | string;
  className?: string;
}> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'Classroom':
      return <GraduationCap className={className} />;
    case 'Laboratory':
      return <FlaskConical className={className} />;
    case 'Transport':
      return <Bus className={className} />;
    case 'Canteen':
      return <Utensils className={className} />;
    case 'Hostel':
      return <Building2 className={className} />;
    case 'Drinking Water':
      return <Droplet className={className} />;
    case 'Restroom':
      return <Sparkles className={className} />;
    case 'Fees':
      return <CreditCard className={className} />;
    case 'Academics':
      return <BookOpen className={className} />;
    case 'Internet/Wi-Fi':
      return <Wifi className={className} />;
    case 'Other':
    default:
      return <HelpCircle className={className} />;
  }
};
