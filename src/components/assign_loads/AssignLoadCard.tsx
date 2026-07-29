import { ListItemText, Menu, MenuItem } from "@mui/material";
import {
  Clock3,
  MoreVertical,
  Ban,
  PenLine,
  PhoneOff,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import DeleteBatchModal from "../common/modal/DeleteBatchModal";
import CommonConfirmModal from "../common/modal/CommonConfirmModal";

interface AssignLoadCardProps {
  driverName: string;
  delivery: string;
  jobId: string;
  loads: number;
  rate?: number;
  contractorRate: number;
  remaining: number;
  pickup: string;
  material: string;
  time: string;
  headerColor: "yellow" | "orange";
  onCancelReroute?: () => void;
  onEditDispatch?: () => void;
  expandOnHover?: boolean;
}

const AssignLoadCard = ({
  driverName,
  delivery,
  jobId,
  // rate,
  remaining,
  contractorRate,
  pickup,
  material,
  time,
  headerColor = "yellow",
  onCancelReroute,
  onEditDispatch,
  expandOnHover = true,
}: AssignLoadCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const collapsedButtonRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(anchorEl);

  const [isWillCall, setIsWillCall] = useState(false);
  const [isWillCallModalOpen, setIsWillCallModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    // Anchor to the collapsed button so the menu stays positioned when portal closes
    setAnchorEl(collapsedButtonRef.current || event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsHovered(false); // Close the expanded card when the menu is dismissed
  };

  const handleMouseEnter = () => {
    if (!expandOnHover || isWillCall) return;
    if (wrapperRef.current) {
      setCardRect(wrapperRef.current.getBoundingClientRect());
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!expandOnHover) return;
    if (anchorEl) return; // Do not collapse if the context menu is open
    setIsHovered(false);
  };

  // Update position on scroll/resize while hovered
  useEffect(() => {
    if (!isHovered) return;
    const update = () => {
      if (wrapperRef.current) {
        setCardRect(wrapperRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isHovered]);

  const showExpanded = !expandOnHover || isHovered;
  const cardContent = (collapsed: boolean) => (
    <>
      {/* Header */}
      <div
        className={`h-[32px] rounded-lg px-2.5 flex items-center justify-between ${
          headerColor === "yellow" ? "bg-[#FFD966]" : "bg-[#FFAD66]"
        }`}
      >
        <h3 className="font-semibold text-xs xl:text-sm whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
          {driverName}
        </h3>

        <button
          ref={collapsed ? collapsedButtonRef : null}
          className="cursor-pointer"
          onClick={handleMenuOpen}
        >
          <MoreVertical size={22} />
        </button>
      </div>

      {/* Delivery */}
      <div className={`mt-1.5 bg-[#90FFC3] rounded-[5px] p-1.5  ${(expandOnHover) ? "h-[52px] overflow-auto":""}`}>
        <p className={`text-[#374151] text-[13px] text-start ${(expandOnHover) ? "truncate":""}`}>
          <span className="font-bold">Delivery: </span>
          {delivery}
        </p>
        <p className="text-[#374151] text-[13px]">
          <span className="font-bold">Job ID: </span>
          {jobId}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <span className="text-[#4A5565] text-[13px] font-medium">Loads:</span>
          <span className="ml-1 text-[13px] font-bold">{remaining}</span>
        </div>
        <div>
          <span className="text-[#4A5565] text-[13px] font-medium">Rate:</span>
          <span className="ml-1 text-[13px] font-bold">${contractorRate}</span>
        </div>
      </div>

      {/* Expanded Section */}
      {(!collapsed || !expandOnHover) && (
        <div
          className="mt-2"
          style={{
            opacity: showExpanded ? 1 : 0,
            transform: showExpanded ? "translateY(0)" : "translateY(-6px)",
            transition: expandOnHover
              ? "opacity .25s ease, transform .25s ease"
              : "none",
          }}
        >
          <div className="border-t border-gray-200 pt-1 pb-1">
            <p className="text-[10px] text-black">Pickup</p>
            <p className="font-semibold text-xs">{pickup || "N/A"}</p>
          </div>

          <div className="border-t border-gray-200 pt-1 pb-1">
            <p className="text-[10px] text-black">Material</p>
            <p className="font-semibold text-xs">{material || "N/A"}</p>
          </div>

          <div className="border-t border-gray-200 pt-2 flex items-center gap-2">
            <Clock3 size={12} />
            <span className="text-[#4A5565] text-xs">{time}</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Placeholder wrapper — keeps layout space */}
      <div
        ref={wrapperRef}
        className={`relative shrink-0 w-[200px] ${
          expandOnHover ? "h-[145px]" : "h-[279px]"
        } cursor-pointer`}
        onMouseEnter={expandOnHover ? handleMouseEnter : undefined}
        onMouseLeave={expandOnHover ? handleMouseLeave : undefined}
        onClick={() => {
          if (isWillCall) {
            setIsReleaseModalOpen(true);
          }
        }}
      >
        {/* Collapsed card — always visible in flow */}
        <div
          className={`absolute top-0 left-0 w-[200px] border border-gray-200 rounded-[5px] py-1.5 px-2 shadow-xs overflow-hidden transition-colors ${
            isWillCall ? "bg-[#d9d9d9] opacity-70 cursor-pointer" : "bg-white"
          }`}
          style={{
            height: expandOnHover ? "140px" : "279px",
            visibility:
              expandOnHover && isHovered && !open ? "hidden" : "visible",
            pointerEvents: isWillCall ? "none" : "auto",
          }}
        >
          {cardContent(true)}
        </div>
      </div>

      {/* Portal — rendered at body level so nothing clips it */}
      {expandOnHover &&
        isHovered &&
        !open &&
        cardRect &&
        ReactDOM.createPortal(
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "fixed",
              top: cardRect.top,
              left: cardRect.left,
              width: cardRect.width,
              zIndex: 99999,
              pointerEvents: "auto",
            }}
          >
            <div className="bg-white border border-gray-200 rounded-[5px] py-1.5 px-2">
              {cardContent(false)}
            </div>
          </div>,
          document.body,
        )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 150,
              borderRadius: "5px",
              boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
              mt: 1,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onCancelReroute?.();
          }}
        >
          <Ban size={12} color="#FF0000" strokeWidth={3} />
          <ListItemText
            primary={
              <span className="text-sm font-medium ml-2">Cancel / Reroute</span>
            }
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEditDispatch?.();
          }}
        >
          <PenLine size={12} color="#3B82F6" strokeWidth={3} />
          <ListItemText
            primary={
              <span className="text-sm font-medium ml-2">Edit Dispatch</span>
            }
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            setIsWillCallModalOpen(true);
          }}
        >
          <PhoneOff
            size={12}
            color="#F26522"
            strokeWidth={3}
            className="scale-x-[-1] "
          />
          <ListItemText
            primary={
              <span className="text-sm font-medium ml-2">Will Call</span>
            }
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            setShowDeleteModal(true);
          }}
        >
          <Trash2 size={12} color="#FF0000" strokeWidth={3} />
          <ListItemText
            primary={
              <span className="text-sm font-medium ml-2">Delete Batch</span>
            }
          />
        </MenuItem>
      </Menu>

      <DeleteBatchModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
        }}
      />

      <CommonConfirmModal
        isOpen={isWillCallModalOpen}
        onClose={() => setIsWillCallModalOpen(false)}
        onConfirm={() => {
          setIsWillCall(true);
          setIsWillCallModalOpen(false);
        }}
        title="Are you sure you want to WILL CALL?"
        description="Lorem Ipsum is simply dummy text"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <CommonConfirmModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        onConfirm={() => {
          setIsWillCall(false);
          setIsReleaseModalOpen(false);
        }}
        title="Release WILL CALL"
        description="Lorem Ipsum is simply dummy text"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
};

export default AssignLoadCard;
