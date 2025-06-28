import * as React from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {type?: 'single' | 'multiple';collapsible?: boolean;
  items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  className,
  type = 'single', // Default to 'single'
  collapsible = true, // Default to true
  ...props
}) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleToggle = (idx: number) => {
    if (openIndex === idx) {
      if (collapsible) {
        setOpenIndex(null);
      }
    } else {
      setOpenIndex(idx);
    }
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {items.map((item, idx) => (
        <div key={idx} className="border-b last:border-b-0">
          <button
            className="w-full flex justify-between items-center py-3 px-2 font-semibold text-left hover:bg-muted transition"
            onClick={() => handleToggle(idx)}
            aria-expanded={openIndex === idx}
          >
            {item.title}
            <span>{openIndex === idx ? '−' : '+'}</span>
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
