import React, { useState, useEffect } from "react";
import { Box, Button, useTheme, InputAdornment, Input, Paper, Typography } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import "./index.css";
import {
  GridRowModes,
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";

function App() {
  const theme = useTheme();
  const [sampleData, setSampleData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsSelected, setRowsSelected] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const pageSize = 10;

  useEffect(() => {
    const apiUrl =
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json";
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        setSampleData(data);
        setDisplayData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow };
    setDisplayData((displayData) =>
      displayData.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleDeleteClick = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this row?");
    if (confirmDelete) {
      const updatedData = displayData.filter((row) => row.id !== id);
      setDisplayData(updatedData);
      console.log(`Delete clicked for ID: ${id}`);
      console.log("Updated Data:", updatedData);
    }
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      const searchTerm = event.target.value.toLowerCase();
      setSearchTerm(searchTerm);

      const filteredData = sampleData.filter((row) => {
        return Object.values(row).some(
          (value) => value && value.toString().toLowerCase().includes(searchTerm)
        );
      });
      setCurrentPage(1);
      setDisplayData(filteredData);
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(displayData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = displayData.slice(startIndex, endIndex);

  const handleDeleteAll = () => {
    const newData = displayData.filter((row) => !rowsSelected.includes(row.id));
    setDisplayData(newData);
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70, headerClassName: "table-header" },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerClassName: "table-header",
      editable: true,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      headerClassName: "table-header",
      editable: true,
      valueOptions: ["admin", "member"],
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({row}) => {
        const isInEditMode = rowModesModel[row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(row.id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(row.id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(row.id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(row.id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box height="80vh" width="90vw" alignSelf="center" position="absolute" top="5vh" left="5vw">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Paper elevation={3} style={{ padding: "10px", marginBottom: "20px", width: "40vw" }}>
          <Input
            type="text"
            placeholder="Search"
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon className="search-icon"/>
              </InputAdornment>
            }
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </Paper>
        <Button onClick={handleDeleteAll}>
          <DeleteIcon />
        </Button>
      </Box>
      <Box
        height="calc(100vh - 200px)"
        sx={{
          "& .MuiDataGrid-toolbarContainer": {
            border: "1px solid black",
            borderRadius: "5px",
          },
          "& .MuiDataGrid-root": {
            border: "1px solid #ccc",
            borderRadius: "5px",
            overflow: "hidden",
            height: "100%",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #ccc",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "black",
            borderBottom: "1px solid #ccc",
            color: "#fff",
            fontFamily: "cursive",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "orange",
            fontFamily: "cursive",
          },
          "& .MuiDataGrid-footerContainer": {
            display: "none",
          },
          "& .MuiCheckbox-root": {
            color: theme.palette.primary.light + " !important",
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={currentData}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          components={{
            Toolbar: GridToolbar,
          }}
          onRowSelectionModelChange={(data)=> {
            setRowsSelected(data);
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            alignItems: "center",
          }}
        >
          <Typography className="RowNo" fontFamily= "cursive">{rowsSelected.length} of {currentData.length} row(s) selected</Typography>
          <Box sx={{ display: "flex", alignItems: "center", fontFamily: "cursive" }}>
            <Typography className="PageNo" fontFamily= "cursive" padding="20px">Page {currentPage} of {totalPages}</Typography>
            <Pagination
              className="Paging"
              count={totalPages}
              page={currentPage}
              variant="outlined"
              shape="rounded"
              onChange={handlePageChange}
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
