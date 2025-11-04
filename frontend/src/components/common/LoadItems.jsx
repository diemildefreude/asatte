import { useCallback, useEffect, useRef, useState } from "react";
import Paginator from "./Paginator";
import { HistoryEntryType } from "../../utils/helpers";
import { Link } from "react-router-dom";

function ItemList({ items, Component, buildProps }) {
  return (
    <>
      {items.map((item, i) => (
        <Component key={i} {...buildProps(item, i)} />
      ))}
    </>
  );
}

function LoadItems({
  fetchMethod,
  renderMethod,
  Component,
  itemString,
  isFullPage = false,
  classes = "",
  fetchAmount = 3,
  user = null,
  headingText = "",
  viewAllLink = ""
}) {
  const [items, setItems] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isInitialLoad = useRef(true);
  const isNavigatingInternally = useRef(false);
  const lastFetchedPage = useRef(null);

  // 🔹 Core fetcher
  const loadItems = useCallback(
    async (page, historyType = HistoryEntryType.Nothing) => {
      if (page === lastFetchedPage.current) return; // Prevent duplicate fetches
      lastFetchedPage.current = page;

      //console.log(` Fetching ${itemString} for page ${page}`);
      try {
        const f = user
          ? async () => await fetchMethod(page, user.id)
          : async () => await fetchMethod(page);
        const data = await f();
        console.log("dataa?", data);
        setItems(data[itemString]);
        setTotalCount(data.total);

        if (!isFullPage) return;

        const params = new URLSearchParams(window.location.search);
        params.set("page", page);
        const newUrl = `${window.location.pathname}?${params.toString()}`;

        if (historyType === HistoryEntryType.Push) {
          window.history.pushState({ page }, "", newUrl);
        } 
        else if (historyType === HistoryEntryType.Replace) 
        {
          window.history.replaceState({ page }, "", newUrl);
        }
      } catch (err) {
        console.error(err);
        setItems([]);
        setTotalCount(0);
      }
    },
    [fetchMethod, isFullPage, itemString, user]
  );

  // 🔹 Initial load or manual URL typing
  useEffect(() => {
    if (!isFullPage) {
      loadItems(1, HistoryEntryType.Nothing);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const pageParam = parseInt(params.get("page") || "1", 10);

    if (isInitialLoad.current) {
      console.log("Setting initial page from URL:", pageParam);
      isInitialLoad.current = false;
      setCurrentPage(pageParam);
      loadItems(pageParam, HistoryEntryType.Replace);
    }
  }, [isFullPage, loadItems]);

  // 🔹 When page changes via internal click
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!isFullPage) {
      loadItems(currentPage, HistoryEntryType.Nothing);
      return;
    }

    if (isNavigatingInternally.current) {
      isNavigatingInternally.current = false;
      loadItems(currentPage, HistoryEntryType.Push);
    } else {
      loadItems(currentPage, HistoryEntryType.Replace);
    }
  }, [currentPage, isFullPage, loadItems]);

  // 🔹 Browser Back/Forward buttons
  useEffect(() => {
    if (!isFullPage) return;

    const handlePop = (event) => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = parseInt(params.get("page") || "1", 10);

      // ✅ Ignore if already on this page to avoid race
      if (pageParam === currentPage) return;

      console.log("Back/Forward detected →", pageParam);
      isNavigatingInternally.current = false;
      setCurrentPage(pageParam);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [isFullPage, currentPage]);

  // 🔹 When user clicks a paginator number
  const onNumberClick = useCallback(
    (pageNum) => {
      if (pageNum !== currentPage) {
        isNavigatingInternally.current = true;
        setCurrentPage(pageNum);
      }
    },
    [currentPage]
  );

  // 🔹 Render
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
      {headingText && (
        <h3 className="centered-content">{headingText}</h3>
      )}
      <div className={`${itemString}-container ${classes}`}>
        {items ? (
          items.length === 0 ? (
            <p className="centered-content">
              {isFullPage || itemString !== "notifications" ? `no ${itemString}` : `no new ${itemString}`}
            </p>
          ) : (
            <ItemList
              items={items}
              Component={Component}
              buildProps={renderMethod}
            />
          )
        ) : (
          <p className="centered-content">loading {itemString}...</p>
        )}
      </div>

      {isFullPage && (
        <Paginator
          itemsPerPage={fetchAmount}
          totalCount={totalCount}
          currentPage={currentPage}
          onNumberClick={onNumberClick}
        />
      )}
      {(!isFullPage && viewAllLink) && (
        <Link
            to={viewAllLink}
            className="centered-content"
        >
            view all
        </Link>
      )}
    </div>
  );
}

export default LoadItems;
