import { useEffect, useRef } from 'react';
import { cn } from '@/app/lib/utils';

export function TextareaAutosize({
  value,
  onChange,
  minRows = 1,
  maxRows = 5,
  className,
  placeholder,
  ...props
}) {
  const textareaRef = useRef(null);

  const handleChange = (event) => {
    const textarea = event.target;
    
    // Reset height to auto to properly calculate new height
    textarea.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.min(
      Math.max(
        textarea.scrollHeight, // Current scroll height
        minRows * 24 // Minimum height (assuming 24px per row)
      ),
      maxRows * 24 // Maximum height
    );
    
    // Set new height
    textarea.style.height = `${newHeight}px`;
    
    // Call onChange handler if provided
    onChange?.(event);
  };

  // Update height on initial render and when value changes
  useEffect(() => {
    if (textareaRef.current) {
      handleChange({ target: textareaRef.current });
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none overflow-hidden",
        className
      )}
      style={{
        minHeight: `${minRows * 24}px`,
        maxHeight: `${maxRows * 24}px`,
      }}
      {...props}
    />
  );
}
