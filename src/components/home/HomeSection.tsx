import React from 'react';
import { Button } from "@/components/ui/button";
interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
  showAllLink?: boolean;
  actionButton?: React.ReactNode; // Prop for action buttons
}
const HomeSection: React.FC<HomeSectionProps> = ({
  title,
  children,
  showAllLink = false,
  // We'll keep this prop to avoid breaking existing code
  actionButton
}) => {
  return <section className="mb-6 w-full">
      
      {children}
    </section>;
};
export default HomeSection;