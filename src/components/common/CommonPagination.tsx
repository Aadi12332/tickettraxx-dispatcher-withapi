import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface CommonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLeftText?: boolean;
}

const CommonPagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isLeftText = true
}: CommonPaginationProps) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const renderPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        i === currentPage ||
        i === currentPage - 1 ||
        i === currentPage + 1
      ) {
        pages.push(i);
      } else if (i === currentPage + 2 || i === currentPage - 2) {
        pages.push("...");
      }
    }

    return [...new Set(pages)];
  };

  return (
    <div className={`flex sm:flex-row flex-col gap-2 items-center justify-between md:pt-5 pt-3 `}>
      {/* Left text */}{" "}
      {isLeftText && (
        <p className="text-[#6B7280] text-xs xl:text-sm font-normal">
          Showing {startItem} to {endItem} of {totalItems} entries{" "}
        </p>
      )}
      {/* Pagination */}
      <div className="flex items-center gap-2 sm:ml-auto">
        {/* Previous */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          className="sm:w-9 w-7 sm:h-9 h-7 flex items-center justify-center rounded-[5px] border border-gray-200 text-gray-500"
        >
          <ChevronLeft size={16} />
        </button>

        {renderPages().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-[#6B7280]">
              <MoreHorizontal size={16} />
            </span>
          ) : (
            <button
              key={index}
              onClick={() => onPageChange(Number(page))}
              className={`sm:w-9 w-7 sm:h-9 h-7 rounded-[5px] text-sm font-medium ${
                currentPage === page
                  ? "bg-[#233B73] text-white"
                  : "border border-gray-200 text-[#6B7280]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          className="sm:w-9 w-7 sm:h-9 h-7 flex items-center justify-center rounded-[5px] border border-gray-200 text-[#6B7280]"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CommonPagination;
