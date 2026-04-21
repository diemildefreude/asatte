const MAX_PAGE_NUMBERS = 5;

function getUrlWithPage(i)
{
    const params = new URLSearchParams(window.location.search);
    params.set('page', i);
    return `${window.location.pathname}?${params}`;
}

function getPageNumbers(currentPage, pageCount) 
{
    if (pageCount <= 1) return [1];

    const half = Math.floor(MAX_PAGE_NUMBERS / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    // Adjust if near the start
    if (start < 1) {
        start = 1;
        end = Math.min(pageCount, MAX_PAGE_NUMBERS);
    }

    // Adjust if near the end
    else if (end > pageCount) {
        end = pageCount;
        start = Math.max(1, pageCount - MAX_PAGE_NUMBERS + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
}


function Paginator({itemsPerPage, totalCount, currentPage, onNumberClick})
{
    const pageCount = Math.ceil(totalCount / itemsPerPage); 
    //console.log("totalCount, itemsPerPage, pageCount, currentPage", totalCount, itemsPerPage, pageCount, currentPage);

    const pageNumbers = getPageNumbers(currentPage, pageCount);

    return(
        pageCount > 1 && (
        <div className="paginator">
        {
            currentPage != 1 && (
                <span>
                    <a 
                        onClick={(e) => { e.preventDefault(); onNumberClick(1)}}
                        href={getUrlWithPage(1)}
                        className="arrow"
                    >
                        {'<<'}
                    </a>
                </span>
            )
        }
        {
            currentPage > 1 && (
                <span>
                    <a 
                        onClick={(e) => { e.preventDefault(); onNumberClick(currentPage - 1)}}
                        href={getUrlWithPage(currentPage - 1)}
                        className="arrow"
                    >
                        {'<'}
                    </a>
                </span>
            )
        }
        {            
            pageNumbers.map((i) => 
            {            
                const isEllipsisBefore = pageNumbers[0] > 1 && i === pageNumbers[0];
                const isEllipsisAfter = pageNumbers[pageNumbers.length - 1] < pageCount && 
                    pageNumbers[pageNumbers.length - 1] === i;
                
                //console.log("currentPage?!", currentPage, i);
                return (<span key={i}>                    
                { isEllipsisBefore && (<>…</>) }
                <a 
                    className={i === currentPage ? 'current-page' : ''}
                    onClick={(e) => { e.preventDefault(); onNumberClick(i)}}
                    href={getUrlWithPage(i)}
                >
                    {i}
                </a>
                { isEllipsisAfter && (<>…</>) }
            </span>)})
        }
        {
            currentPage < pageCount && (
                <span>
                    <a 
                        onClick={(e) => { e.preventDefault(); onNumberClick(currentPage + 1)}}
                        href={getUrlWithPage(currentPage + 1)}
                        className="arrow"
                    >
                        {'>'}
                    </a>
                </span>
            )
        }
        {
            currentPage != pageCount && (
                <span>
                    <a 
                        onClick={(e) => { e.preventDefault(); onNumberClick(pageCount)}}
                        href={getUrlWithPage(pageCount)}
                        className="arrow"
                    >
                        {'>>'}
                    </a>
                </span>
            )
        }
        </div>
        )
    );
}

export default Paginator;