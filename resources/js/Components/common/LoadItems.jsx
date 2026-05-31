import { useCallback, useEffect, useState } from "react";
import Paginator from "./Paginator";
import { Link, router, usePage } from '@inertiajs/react';

function ItemList({ items, Component, buildProps }) {
  return (
    <>
      {items.map((item, i) => (
        <Component key={item.id ?? i} {...buildProps(item, i)} />
      ))}
    </>
  );
}

function LoadItems({
  initialItems = null,
  partialProp = null,
  renderMethod,
  Component,
  itemString,
  isFullPage = false,
  classes = "",
  fetchAmount = 10,
  headingText = "",
  viewAllLink = ""
}) {
  const { props } = usePage();
  const partial = isFullPage && partialProp ? props[partialProp] : null;

  const normalizeItems = (source) => {
    if (!source) return [];
    if (source.data && Array.isArray(source.data)) return source.data;
    if (Array.isArray(source)) return source;
    return [];
  };

  const initialItemsFromProp = !isFullPage ? normalizeItems(initialItems) : normalizeItems(partial);

  const [items, setItems] = useState(initialItemsFromProp);
  const [currentPage, setCurrentPage] = useState(partial?.current_page || 1);
  const [totalCount, setTotalCount] = useState(partial?.total || initialItemsFromProp.length);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFullPage && partialProp && partial) {
      setItems(normalizeItems(partial));
      setCurrentPage(partial.current_page || 1);
      setTotalCount(partial.total || normalizeItems(partial).length);
      setIsLoading(false);
    } else if (!isFullPage && initialItems) {
      setItems(normalizeItems(initialItems));
      setTotalCount(normalizeItems(initialItems).length);
    }
  }, [partial, isFullPage, partialProp, initialItems]);

  const onNumberClick = useCallback((pageNum) => {
    if (pageNum !== currentPage) {
      setIsLoading(true);
      router.get(window.location.pathname, { page: pageNum }, {
        only: [partialProp],
        preserveState: true,
        preserveScroll: true,
      });
    }
  }, [currentPage, partialProp]);

  return (
    <div className="items-heading-container">
      {isFullPage && (
        <Paginator
          itemsPerPage={fetchAmount}
          totalCount={totalCount}
          currentPage={currentPage}
          onNumberClick={onNumberClick}
        />
      )}
      {headingText && <h3 className="centered-content">{headingText}</h3>}
      
      <div className={`${itemString}-container ${classes}`}>
        {isLoading ? (
          <p className="centered-content">loading {itemString}...</p>
        ) : (items && items.length > 0 ? (
          <ItemList
            items={items}
            Component={Component}
            buildProps={renderMethod}
          />
        ) : (
          <p className="centered-content">no {itemString}</p>
        ))}
      </div>

      {isFullPage && (
        <Paginator
          itemsPerPage={fetchAmount}
          totalCount={totalCount}
          currentPage={currentPage}
          onNumberClick={onNumberClick}
        />
      )}

      {!isFullPage && viewAllLink && (
        <Link href={viewAllLink} className="centered-content">view all</Link>
      )}
    </div>
  );
}

export default LoadItems;