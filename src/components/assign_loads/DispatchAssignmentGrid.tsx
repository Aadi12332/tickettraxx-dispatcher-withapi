import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";

import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AllCommunityModule, themeQuartz } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const modules = [AllCommunityModule];

import DriverTooltip from "./DriverTooltip";
import { Tooltip } from "@mui/material";

const LOAD_COLOR_MAP: Record<number, string> = {
  1: "#FDE68A", // yellow
  2: "#FBBF24", // halka dark yellow
  3: "#D97706", // dark yellow (amber)
  4: "#86EFAC", // light green
  5: "#15803D", // dark green
};


const JobCell = (
  params: ICellRendererParams & { occurrencesBefore?: number; jobId?: string },
) => {
  const isButtonEnabled = params.context.buttonStatus;

  const value =
    typeof params.value === "object" ? params.value?.loads : params.value;

  if (value === undefined || value === null)
    return null;

  const isSummaryRow =
    params.data?.rowType === "total" || params.data?.rowType === "remaining";

  // Current job entry (jaisa pehle matchingJobs se nikala jata tha)
  let currentJob: any = null;
  if (!isSummaryRow && params.data?.jobs && params.jobId) {
    const matchingJobs = params.data.jobs.filter(
      (j: any) => j.id === params.jobId,
    );
    currentJob = matchingJobs[params.occurrencesBefore || 0];
  }

  const isCancelled = currentJob?.iscancelled === true;

  let isChanged = false;
  if (!isSummaryRow && params.data?.driver && params.context?.originalRowData) {
    const originalRow = params.context.originalRowData.find(
      (r: any) => r.driver === params.data.driver,
    );
    if (originalRow) {
      const origMatchingJobs = (originalRow.jobs || []).filter(
        (j: any) => j.id === params.jobId,
      );
      const originalValue =
        origMatchingJobs[params.occurrencesBefore || 0]?.loads ?? "";
      if (String(originalValue) !== String(value)) {
        isChanged = true;
      }
    }
  }

  // Poora cell tabhi clickable hoga jab job cancelled ho
  const canClickToCancel = !isSummaryRow && isCancelled;

  const handleCellClick = () => {
    if (!canClickToCancel) return;
    if (isButtonEnabled) return; // pehle wali gating (edit-mode) same rakhi
    params.context.openCancelDrawer();
  };

  // Color priority: cancelled (red) > loadCompleted-based scale (only when
  // loads > 1) > changed (blue) > default. Total `value`/`loads` count no
  // longer drives color — only `loadCompleted` does, and only if loads > 1.
  const numericValue = Number(value);
  const loadCompleted = currentJob?.loadCompleted;

  const completedColor =
    !isSummaryRow && numericValue > 1 && loadCompleted !== undefined
      ? LOAD_COLOR_MAP[Number(loadCompleted)]
      : undefined;

  let textColor = "#364153"; // default
  let isBold = false;

  if (isCancelled) {
    textColor = "#FF0000";
    isBold = true;
  } else if (completedColor) {
    textColor = completedColor;
    isBold = true;
  } else if (isChanged) {
    textColor = "#2563EB";
    isBold = true;
  }

  return (
    <div
      onClick={handleCellClick}
      className={`flex items-center justify-center w-full h-full ${canClickToCancel ? "cursor-pointer" : ""
        }`}
    >
      <span style={{ color: textColor, fontWeight: isBold ? 600 : undefined }}>
        {params.value}
      </span>
    </div>
  );
};

// const WeCallCell = (params: ICellRendererParams) => {
//   const buttonStatus = params.context.buttonStatus;

//   const isSummaryRow =
//     params.data?.rowType === "total" || params.data?.rowType === "remaining";

//   const [checked, setChecked] = useState(
//     buttonStatus !== undefined ? buttonStatus : !!params.value,
//   );

//   useEffect(() => {
//     if (buttonStatus !== undefined) {
//       setChecked(buttonStatus);
//       params.node.setDataValue("weCall", buttonStatus);
//     }
//   }, [buttonStatus]);

//   const handleToggle = () => {
//     const newValue = !checked;
//     setChecked(newValue);
//     params.node.setDataValue("weCall", newValue);
//   };

//   return (
//     <div className="h-full w-full flex items-center justify-center">
//       {!isSummaryRow && (
//         <IOSSwitch checked={checked} onChange={handleToggle} sx={{ m: 0 }} />
//       )}
//     </div>
//   );
// };
const DriverRenderer = (props: any) => {
  // const truckId = props.data?.truckId;
  const canOpenTooltip =
    Array.isArray(props.data?.truckId) &&
    props.data.truckId.length > 1;

  return (
    <button
      onMouseEnter={(e) => {
        if (!canOpenTooltip) return;

        props.context.openDriverPopup(
          e.currentTarget.getBoundingClientRect(),
          props.value,
        );
      }}
      onMouseLeave={() => {
        props.context.closeDriverPopup();
      }}
      className="w-full h-full flex items-center justify-start text-left font-medium overflow-hidden text-sm"
      style={{
        color:
          props.data.status === "RED"
            ? "#FF4E4E"
            : props.data.status === "GREEN"
              ? "#00B050"
              : "#D7A100",
      }}
    >
      {props.value}
    </button>
  );
};

const DispatchAssignmentGrid = ({
  onOpenCancelDrawer,
  onRowClicked,
  buttonStatus,
  rowData,
  setRowData,
  originalRowData,
  handleUpdate,
  customHeight,
  jobHeaders,
  footer,
  matrixData,
  enableColumnResize = true,
}: any) => {
  console.log(footer)
  // const jobHeaders = useAppSelector(selectJobHeaders);
  const [driverPopup, setDriverPopup] = useState<any>(null);

  const pinnedBottomRowData = useMemo(() => {
    if (!jobHeaders) return [];
    const totalJobs = jobHeaders?.map((job: string, index: number) => ({
      id: job,
      loads: matrixData?.columns?.[index]?.totalAssigned ?? 0,
    }));

    const remainingJobs = jobHeaders?.map((job: string, index: number) => ({
      id: job,
      loads: matrixData?.columns?.[index]?.remaining ?? 0,
    }));

    return [
      {
        truckId: "Total",
        rowType: "total",
        jobs: totalJobs,
        tonnage: footer?.grandTonnage,
        total: footer?.grandTotal,
      },
      {
        truckId: "Remaining",
        rowType: "remaining",
        jobs: remainingJobs,
        tonnage: 0,
        total: 0,
      },
    ];
  }, [footer, jobHeaders, matrixData]);
  const defaultColDef = useMemo(
    () => ({
      cellStyle: (params: any) => {
        const isPinned = params.node?.rowPinned;

        if (!isPinned) {
          const field = params.colDef.field;
          const driver = params.data?.driver;
          const originalRowData = params.context?.originalRowData;
          let isChanged = false;

          if (driver && originalRowData && field) {
            const originalRow = originalRowData.find(
              (r: any) => r.driver === driver,
            );
            if (originalRow) {
              if (field.startsWith("jobs.")) {
                const jobId = params.colDef.cellRendererParams?.jobId;
                const occurrencesBefore =
                  params.colDef.cellRendererParams?.occurrencesBefore ?? 0;
                const matchingJobs = (originalRow.jobs || []).filter(
                  (j: any) => j.id === jobId,
                );
                const origValue = matchingJobs[occurrencesBefore]?.loads ?? "";
                if (String(params.value) !== String(origValue)) {
                  isChanged = true;
                }
              } else if (field === "tonnage" || field === "total") {
                const currentValue = params.value;
                const origValue = originalRow[field];
                if (String(currentValue) !== String(origValue)) {
                  isChanged = true;
                }
              }
            }
          }

          return {
            borderRight: "1px solid #C8C8C8",
            color: isChanged ? "#2563EB" : "#364153",
            fontWeight: isChanged ? 700 : undefined,
            fontSize: "14px",
            justifyContent: field === "tonnage" ? "center" : undefined,
          };
        }

        const field = params.colDef.field;

        const yellowCols = [
          "job6014",
          "job1143B",
          "job1143C",
          "job1142A",
          "job1142C",
        ];

        const orangeCols = ["job1143A", "job6543", "job1143D", "job1142B"];

        const style: any = {
          fontWeight: 700,
          borderRight: "1px solid #C8C8C8",
          fontSize: "14px",
        };

        if (field?.startsWith("jobs.")) {
          const index = Number(field.split(".")[1]);

          if ([0, 2, 4, 6, 8].includes(index)) {
            style.background = "#F4D35E";
          }

          if ([1, 3, 5, 7].includes(index)) {
            style.background = "#F4A65D";
          }
        }
        if (field === "truckId") {
          style.background = "#D9E6F2";
        }

        if (yellowCols.includes(field || "")) {
          style.background = "#F4D35E";
        }

        if (orangeCols.includes(field || "")) {
          style.background = "#F4A65D";
        }

        if (field === "tonnage" || field === "total") {
          style.background =
            params.data.rowType === "total" ? "#D9F0E3" : "#F8D7DA";

          style.color = params.data.rowType === "total" ? "#009245" : "#FF0000";
        }

        return style;
      },
    }),
    [],
  );
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "select",
        headerName: "",
        headerCheckboxSelection: true,
        width: 40,
        minWidth: 40,
        // pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        headerClass: "checkbox-header-cell",
        cellClass: "checkbox-cell",
        checkboxSelection: (params) => !params.node.rowPinned,
      },

      {
        field: "driver",
        headerName: "Driver",
        // pinned: "left",
        minWidth: 150,
        width: 150,
        // flex: 2,
        cellRenderer: DriverRenderer,
        headerClass: "blue-header",
        wrapText: true,
      },
      {
        field: "truckId",
        headerName: "Truck ID",
        minWidth: 90,
        flex: 1,
        headerClass: "blue-header",

        valueGetter: (params) => {
          const truckIds = params.data?.truckId ?? [];

          if (!Array.isArray(truckIds)) return truckIds;

          return truckIds.length === 1
            ? truckIds[0]
            : `${truckIds[0]} to ${truckIds[truckIds.length - 1]}`;
        },

        headerComponent: () => (
          <Tooltip
            title={`Truck ID`}
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: "#fff",
                  color: "#000",
                  border: "1px solid #E5E7EB",
                  fontWeight: 500,
                },
              },
              arrow: {
                sx: {
                  color: "#fff",
                  "&::before": {
                    border: "1px solid #E5E7EB",
                  },
                },
              },
            }}
          >
            <span>Truck ID</span>
          </Tooltip>
        ),
      },
      ...(jobHeaders ?? []).map((job: string, index: number) => {
        const occurrencesBefore = jobHeaders
          .slice(0, index)
          .filter((h:any) => h === job).length;

        const getCurrentJobEntry = (data: any) => {
          if (!data?.jobs) return null;
          const matchingJobs = data.jobs.filter((j: any) => j.id === job);
          return matchingJobs[occurrencesBefore] ?? null;
        };

        return {
          headerName: `#${job}`,
          field: `jobs.${index}`,
          headerComponent: () => {
            const column = matrixData?.columns?.find(
              (x: any) => x.poCode === job,
            );

            const location = column?.location ?? "";

            return (
              <Tooltip
                title={
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-[10px]">
                      Job ID #{job}
                    </span>
                    <span className="text-[9px] font-normal">{location}</span>
                  </div>
                }
                arrow
                placement="top"
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "#fff",
                      color: "#000",
                      border: "1px solid #E5E7EB",
                      fontWeight: 500,
                    },
                  },
                  arrow: {
                    sx: {
                      color: "#fff",
                      "&::before": {
                        border: "1px solid #E5E7EB",
                      },
                    },
                  },
                }}
              >
                <div className="flex flex-col items-center justify-center leading-tight py-1 w-full">
                  <span className="text-xs font-semibold">#{job}</span>
                  <span className="text-[10px] text-[#666] font-normal block text-center truncate w-full max-w-full">
                    {location}
                  </span>
                </div>
              </Tooltip>
            );
          },
          minWidth: 40,
          wrapText: true,
          flex: 1,
          cellRenderer: JobCell,
          cellRendererParams: {
            occurrencesBefore,
            jobId: matrixData?.columns?.[index]?.poCode,
          },
          editable: (params: any) => {
            if (!enableColumnResize) return false;
            const isSummaryRow =
              params.data?.rowType === "total" ||
              params.data?.rowType === "remaining";
            if (isSummaryRow) return false;

            const currentJob = getCurrentJobEntry(params.data);
            if (currentJob?.iscancelled === true) return false;

            return true;
          },

          valueGetter: (params: any) => {
            const matchingJobs = (params.data.jobs || []).filter(
              (j: any) => j.id === job,
            );
            return matchingJobs[occurrencesBefore]?.loads ?? "";
          },
          valueSetter: (params: any) => {
            const newValue = parseInt(params.newValue, 10);
            if (isNaN(newValue) && params.newValue !== "") return false;
            const finalValue = isNaN(newValue) ? 0 : newValue;

            let matchCount = 0;
            const targetIndex = (params.data.jobs || []).findIndex((j: any) => {
              if (j.id === job) {
                if (matchCount === occurrencesBefore) return true;
                matchCount++;
              }
              return false;
            });

            if (targetIndex !== -1) {
              const jobs = [...(params.data.jobs || [])];

              jobs[targetIndex] = {
                ...jobs[targetIndex],
                loads: finalValue,
              };

              const updatedRows = rowData.map((row: any) => {
                if (row.driver !== params.data.driver) return row;

                return {
                  ...row,
                  jobs,
                };
              });

              setRowData(updatedRows);

              params.data.jobs = jobs;

              return true;
            } else {
              const jobs = [...(params.data.jobs || [])];

              let currentCount = jobs.filter((j: any) => j.id === job).length;

              while (currentCount < occurrencesBefore) {
                jobs.push({
                  id: job,
                  loads: 0,
                });
                currentCount++;
              }

              jobs.push({
                id: job,
                loads: finalValue,
                isManual: true,
              });

              const updatedRows = rowData.map((row: any) => {
                if (row.driver !== params.data.driver) return row;

                return {
                  ...row,
                  jobs,
                };
              });

              setRowData(updatedRows);

              return true;
            }
            return true;
          },
          headerClass: index % 2 === 0 ? "job-yellow" : "job-orange",
        };
      }),

      {
        field: "tonnage",
        headerName: "Tonnage",
        minWidth: 85,
        flex: 1,
        // wrapText: true,
        editable: enableColumnResize,
        resizable: true,
        // pinned:"right"
      },

      {
        field: "total",
        headerName: "Total",
        flex: 1,
        minWidth: 80,
        // wrapText: true,
        editable: enableColumnResize,
        // pinned: "right",
        colSpan: (params) => {
          if (
            params.data?.rowType === "total" ||
            params.data?.rowType === "remaining"
          ) {
            return 4;
          }
          return 1;
        },
      },

      // {
      //   field: "weCall",
      //   headerName: "WILL CALL",
      //   minWidth: 80,
      //   flex:1,
      //   cellRenderer: WeCallCell,
      // },

      // {
      //   headerName: "Update",
      //   minWidth: 75,
      //   maxWidth: 75,
      //   flex: 1,
      //   cellRenderer: UpdateCell,
      //   // pinned: "right",
      // },
    ],
    [
      jobHeaders,
      matrixData,
      rowData,
      setRowData,
      enableColumnResize,
    ],
  );

  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    const handleResize = () => {
      gridRef.current?.api.sizeColumnsToFit();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeTimeoutRef = useRef<number | null>(null);

  const openDriverPopup = useCallback((rect: DOMRect, driver: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    setDriverPopup({
      driver,
      left: rect.left,
      top: rect.bottom,
    });
  }, []);

  const closeDriverPopup = useCallback(() => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setDriverPopup(null);
    }, 150);
  }, []);

  const keepDriverPopupOpen = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const gridContext = useMemo(
    () => ({
      handleUpdate,
      openCancelDrawer: onOpenCancelDrawer,
      openDriverPopup,
      closeDriverPopup,
      keepDriverPopupOpen,
      buttonStatus,
      originalRowData,
    }),
    [
      handleUpdate,
      onOpenCancelDrawer,
      openDriverPopup,
      closeDriverPopup,
      keepDriverPopupOpen,
      buttonStatus,
      originalRowData,
    ],
  );

  return (
    <AgGridProvider modules={modules}>
      <div
        className={`ag-theme-alpine ${customHeight || "h-[calc(100vh-105px)]"}`}
        style={
          {
            width: "100%",
            minWidth: "1100px",
            "--ag-background-color": "#ffffff",
            "--ag-header-background-color": "#ffffff",
            "--ag-row-border-color": "#D1D5DB",
            "--ag-border-color": "#D1D5DB",
            "--ag-font-size": "16px",
          } as React.CSSProperties
        }
      >
        <div className="ag-theme-alpine w-full h-full">
          <AgGridReact
            ref={gridRef}
            theme={themeQuartz}
            rowData={rowData}
            // onCellValueChanged={() => {
            //   setRowData((prev: any) => [...prev]);
            // }}
            columnDefs={columnDefs}
            context={gridContext}
            defaultColDef={defaultColDef}
            rowHeight={40}
            headerHeight={40}
            // rowSelection="multiple"
            suppressRowClickSelection={buttonStatus}
            pinnedBottomRowData={pinnedBottomRowData}
            stopEditingWhenCellsLoseFocus={false}
            singleClickEdit={true}
          />
        </div>
      </div>

      {driverPopup && (
        <div
          className="fixed"
          style={{
            left: driverPopup.left,
            top: driverPopup.top,
          }}
        >
          <DriverTooltip
            onClose={() => setDriverPopup(null)}
            onRowClicked={() => {
              setDriverPopup(null);
              onRowClicked();
            }}
            onMouseEnter={keepDriverPopupOpen}
            onMouseLeave={closeDriverPopup}
          />
        </div>
      )}
    </AgGridProvider>
  );
};

export default DispatchAssignmentGrid;
