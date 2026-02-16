
import TitleHeader from "@/components/layout/TitleHeader";

interface ProjectHeaderProps {
  project: any;
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {

  return (
    <div className="flex items-center gap-4">
    
      <TitleHeader
        title={project.name}
        description={`${project.type.charAt(0).toUpperCase() + project.type.slice(1)} Project`}
      />
    </div>
  );
};
