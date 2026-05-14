"use client";

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextInlineProps {
  contentKey: keyof ReturnType<typeof useAdmin>['siteContent'];
  as?: 'input' | 'textarea' | 'h1' | 'h2' | 'p' | 'span';
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  children?: React.ReactNode;
}

export default function EditableTextInline({
  contentKey,
  as = 'span',
  className,
  inputClassName,
  placeholder,
  children
}: EditableTextInlineProps) {
  const { isAdmin, hasMounted, siteContent, updateSiteContent, commitHistory } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(() => (siteContent[contentKey] as string) || (typeof children === 'string' ? children : ''));
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs on both server and client, ensuring initial state is consistent.
    if (!isEditing) {
      setCurrentValue(siteContent[contentKey] as string || (typeof children === 'string' ? children : ''));
    }
  }, [siteContent, contentKey, children, isEditing]);

  const handleEditClick = () => {
    if (isAdmin && hasMounted) {
      commitHistory();
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
  };

  const saveChanges = () => {
    if (currentValue !== siteContent[contentKey]) {
      updateSiteContent(contentKey, currentValue);
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    saveChanges();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && as !== 'textarea') {
      saveChanges();
    } else if (e.key === 'Escape') {
      setCurrentValue(siteContent[contentKey] as string || '');
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const showAdminUI = mounted && hasMounted && isAdmin;

  if (showAdminUI && isEditing) {
    const commonProps = {
      ref: inputRef as React.RefObject<HTMLInputElement>,
      value: currentValue,
      onChange: handleInputChange,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: cn("w-full", inputClassName || className),
      placeholder: placeholder || "Enter text...",
    };
    // Correctly render Textarea with `value` prop and no children
    if (as === 'textarea') {
      return <Textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={currentValue} onChange={handleInputChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className={cn("w-full", inputClassName || className)} placeholder={placeholder || "Enter text..."} rows={4} />;
    }
    return <Input {...commonProps} />;
  }

  const Tag = as;

  // Correctly render Textarea for display mode with `value` prop and no children
  if (as === 'textarea') {
    // We render a <p> tag for display mode to avoid nesting issues and for semantic HTML.
    return (
      <p
        className={cn(className, showAdminUI && "relative group cursor-pointer hover:outline hover:outline-dashed hover:outline-primary/50 p-1 -m-1 rounded-sm")}
        onClick={handleEditClick}
        title={showAdminUI ? "Click to edit" : undefined}
      >
        {currentValue}
        {showAdminUI && !isEditing && (
          <Edit3 className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </p>
    );
  }

  return (
    <Tag
      className={cn(
        className,
        showAdminUI && "relative group cursor-pointer hover:outline hover:outline-dashed hover:outline-primary/50 p-1 -m-1 rounded-sm"
      )}
      onClick={handleEditClick}
      title={showAdminUI ? "Click to edit" : undefined}
    >
      {currentValue}
      {showAdminUI && !isEditing && (
        <Edit3 className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Tag>
  );
}
