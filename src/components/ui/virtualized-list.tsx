import React from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> extends Omit<FixedSizeListProps, 'children' | 'itemCount' | 'itemSize'> {
  items: T[];
  itemSize: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  overscan?: number;
  scrollToIndex?: number;
}

export function VirtualizedList<T>({
  items,
  itemSize,
  renderItem,
  className,
  itemClassName,
  overscan = 5,
  scrollToIndex,
  ...props
}: VirtualizedListProps<T>) {
  const listRef = React.useRef<FixedSizeList>(null);
  
  React.useEffect(() => {
    if (scrollToIndex !== undefined && listRef.current) {
      listRef.current.scrollToItem(scrollToIndex, 'center');
    }
  }, [scrollToIndex]);
  
  return (
    <FixedSizeList
      ref={listRef}
      className={cn("scrollbar-thin", className)}
      itemCount={items.length}
      itemSize={itemSize}
      overscanCount={overscan}
      {...props}
    >
      {({ index, style }) => (
        <div 
          style={style} 
          className={cn("transition-colors", itemClassName)}
        >
          {renderItem(items[index], index)}
        </div>
      )}
    </FixedSizeList>
  );
}