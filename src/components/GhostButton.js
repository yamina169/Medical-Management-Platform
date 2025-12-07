import { ArrowRight } from "lucide-react";

const GhostButton = ({ href, title }) => {
  return (
    <a
      href={href}
      className="inline-flex font-medium text-xm group gap-2 items-center"
    >
      <span>{title}</span>
      <span>
        <ArrowRight
          className="group-hover:translate-x-1 duration-300"
          size={15}
        />
      </span>
    </a>
  );
};

export default GhostButton;
