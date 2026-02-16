import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface TitleHeaderProps {
  title: string;
  description: string;
  link?: string;
}

const TitleHeader = ({ title, description, link }: TitleHeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-8">
      <Button
        onClick={() => (link ? navigate(link) : navigate(-1))}
        variant="outline"
        className="shadow-none"
        size="lg"
      >
        <ArrowLeft />
      </Button>
      <div>
        <h1 className="text-4xl font-bold ">{title}</h1>
        <p className="text-black/80">{description}</p>
      </div>
    </header>
  );
};

export default TitleHeader;
