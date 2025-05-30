import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface AlbumNavigationProps {
  onGoBack?: () => void;
}
const AlbumNavigation: React.FC<AlbumNavigationProps> = ({
  onGoBack
}) => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };
  return <div className="sticky top-0 z-10 backdrop-blur-md bg-transparent pt-4">
      
    </div>;
};
export default AlbumNavigation;