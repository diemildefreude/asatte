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
  fetchAmount = 10, // Ensure this matches Laravel $itemsPerPage
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

  // 🔹 Core fetcher with integrated Clamping
  const loadItems = useCallback(async (page, historyType = HistoryEntryType.Nothing) => 
  {
    try 
    {
      const f = user
        ? async () => await fetchMethod(page, user.id)
        : async () => await fetchMethod(page);
      
      const data = await f();
      //console.log("loaded data", data);
      const total = data.total || 0;
      const fetchedItems = data[itemString] || [];

      // 1. Calculate the real max page
      const maxPage = Math.max(1, Math.ceil(total / fetchAmount));
      
      // 2. Clamp Logic
      let pageClamped = page;
      if (page < 1) pageClamped = 1;
      if (page > maxPage && total > 0) pageClamped = maxPage;

      // 3. If correction needed, sync State + URL and re-fetch
      if (page !== pageClamped) 
      {
        //console.log(`Syncing ${page} -> ${pageClamped}`);
        setCurrentPage(pageClamped);
        lastFetchedPage.current = pageClamped;

        if (isFullPage) 
        {
          const params = new URLSearchParams(window.location.search);
          params.set("page", pageClamped);
          window.history.replaceState({ page: pageClamped }, "", `${window.location.pathname}?${params.toString()}`);
        }

        // Recursive call to get the actual data for the corrected page
        loadItems(pageClamped, HistoryEntryType.Replace);
        return;
      }
      //console.log("errthing", fetchedItems, total, page);
      // 4. Commit data to state
      setItems(fetchedItems);
      setTotalCount(total);
      lastFetchedPage.current = page;

      // 5. Update URL history if needed
      if (isFullPage) 
      {
        const params = new URLSearchParams(window.location.search);
        if (parseInt(params.get("page") || "1", 10) !== page) 
        {
          params.set("page", page);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          if (historyType === HistoryEntryType.Push) 
          {
            window.history.pushState({ page }, "", newUrl);
          } 
          else if (historyType === HistoryEntryType.Replace) 
          {
            window.history.replaceState({ page }, "", newUrl);
          }
        }
      }
    } 
    catch (err) 
    {
      console.error(err);
      setItems([]);
      setTotalCount(0);
    }
  }, [fetchMethod, isFullPage, itemString, user, fetchAmount]);

  // 🔹 Effect 1: Handle Initial URL / Page Load
  useEffect(() => 
  {
    if (!isFullPage) 
    {
      //console.log("not full page load");
      loadItems(1, HistoryEntryType.Nothing);
      return;
    }

    if (isInitialLoad.current) 
    {
      isInitialLoad.current = false;
      const params = new URLSearchParams(window.location.search);
      let pageParam = parseInt(params.get("page") || "1", 10);

      // Immediate fix for sub-zero values to avoid Page 0 flash
      if (pageParam < 1) {
        pageParam = 1;
      }

      setCurrentPage(pageParam);
      loadItems(pageParam, HistoryEntryType.Replace);
    }
  }, [isFullPage]);

  // 🔹 Effect 2: Handle Internal State Changes (Paginator clicks)
  useEffect(() => 
  {
    if (isInitialLoad.current) return;

    if (!isFullPage) 
    {
        loadItems(currentPage, HistoryEntryType.Nothing);
        console.log("internal, !isFullPage");
        return;
    }

    // Only fetch if state changed from what we last loaded
    if (currentPage !== lastFetchedPage.current) 
    {
      const type = isNavigatingInternally.current 
        ? HistoryEntryType.Push 
        : HistoryEntryType.Replace;
      
      isNavigatingInternally.current = false; // Reset flag
      console.log("internal", "currentPage !== lastFetchedPage.current");
      loadItems(currentPage, type);
    }
  }, [currentPage, isFullPage, loadItems]);

  // 🔹 Effect 3: Browser Back/Forward buttons
  useEffect(() => 
  {
    if (!isFullPage) return;

    const handlePop = () => 
    {
      const params = new URLSearchParams(window.location.search);
      const pageParam = parseInt(params.get("page") || "1", 10);
      if (pageParam !== currentPage) {
        isNavigatingInternally.current = false;
        setCurrentPage(pageParam);
      }
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [isFullPage, currentPage]);

  const onNumberClick = useCallback((pageNum) => 
  {
    if (pageNum !== currentPage) {
      isNavigatingInternally.current = true;
      setCurrentPage(pageNum);
    }
  }, [currentPage]);

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
        {/* Only show items if the current state matches the last successful fetch */}
        {items && currentPage === lastFetchedPage.current ? (
          items.length === 0 ? (
            <p className="centered-content">no {itemString}</p>
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

      {!isFullPage && viewAllLink && (
        <Link to={viewAllLink} className="centered-content">view all</Link>
      )}
    </div>
  );
}

export default LoadItems;