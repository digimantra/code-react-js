import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTickets, reset } from "../features/tickets/ticketSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { format } from "date-fns";
import { capitalizeFirstLetter } from "../helpers/utils";
import { FaEye } from "react-icons/fa";
import CreateTicketModal from "../components/CreateTicketModal";
import { getAllDepartments } from "../features/department/departmentSlice";

function Tickets() {
  const { tickets, isLoading, isSuccess } = useSelector(
    (state) => state.tickets
  );

  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredTickets, setFilteredTickets] = useState(tickets?.tickets);
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );

  const [openTicketModal, setOpenTicketModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Unmounting
    return () => {
      if (isSuccess) {
        dispatch(reset());
      }
    };
  }, [dispatch, isSuccess]);

  const [isClosedTickets, setIsClosedTickets] = useState(false);

  useEffect(() => {
    dispatch(getTickets({ isClosedTickets }));
  }, [dispatch, isClosedTickets]);

  const handleCloseTickets = (val) => {
    setIsClosedTickets(val);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: 1,
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      isclosedtickets: isClosedTickets,
    });
  }, [isClosedTickets]);

  useEffect(() => {
    if (isClosedTickets) {
      setFilteredTickets(
        tickets?.tickets?.filter((el) => el?.status?.toLowerCase() === "close")
      );
    } else {
      setFilteredTickets(
        tickets?.tickets?.filter((el) => el?.status?.toLowerCase() !== "close")
      );
    }
  }, [isClosedTickets, tickets]);

  useEffect(() => {
    dispatch(getAllDepartments());
  }, []);

  const handlePageChange = (e, page) => {
    if (page === Number(currentPage) - 1) {
      return;
    }
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: Number(page) + 1,
    });
    setCurrentPage(Number(page) + 1);
    dispatch(
      getTickets({ page: Number(page) + 1, isClosedTickets: isClosedTickets })
    );
  };

  const columns = [
    { id: "ticketNo", label: "Ticket ID", width: "100px" },
    { id: "isOnPriority", label: "Priority" },
    { id: "name", label: "Username", width: "160px" },
    { id: "project", label: "Project" },
    { id: "status", label: "Status" },
    { id: "createdAt", label: "Created on", width: "180px" },
    { id: "dueDate", label: "Due Date", width: "150px" },
    { id: "action", label: "Action" },
  ];

  const tableLoader = () => {
    return [...new Array(10)].map((_, i) => (
      <TableRow key={i}>
        {[...new Array(8)].map((_, i) => (
          <TableCell key={i}>
            <Skeleton variant="text" animation="wave" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <>
      <h1 className="text-left mb-4 pl-2">Tickets</h1>
      <div className="flex justify-between items-center mb-3">
        <RadioGroup
          row
          name="row-radio-buttons-group divide-x"
          value="all"
          className="border border-gray-300 rounded-xl pl-4"
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="All"
            checked={!isClosedTickets}
            onChange={() => handleCloseTickets(false)}
            className="border-r border-gray-300 pr-8"
          />
          <FormControlLabel
            value="closed"
            control={<Radio />}
            label="Closed"
            checked={isClosedTickets}
            onChange={() => handleCloseTickets(true)}
          />
        </RadioGroup>
        <button
          className="btn bg-primary text-white"
          onClick={() => {
            setOpenTicketModal(true);
          }}
        >
          Create New Ticket
        </button>
      </div>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column?.id}
                    style={{ width: column?.width, fontWeight: "600" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                tableLoader()
              ) : (
                <>
                  {filteredTickets?.length ? (
                    filteredTickets?.map((ticket) => (
                      <TableRow key={ticket?._id}>
                        <TableCell>
                          <span className="text-primary">
                            {ticket?.ticketNo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {ticket?.isOnPriority ? "High" : "-"}
                          </span>
                        </TableCell>
                        <TableCell>{ticket?.name}</TableCell>
                        <TableCell>{ticket?.project}</TableCell>
                        <TableCell style={{ minWidth: 140 }}>
                          <span className={`status status-${ticket?.status}`}>
                            {capitalizeFirstLetter(ticket?.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(ticket?.createdAt),
                            "MMM dd, yyyy h:mm a"
                          )}
                        </TableCell>

                        <TableCell>
                          {ticket?.dueDate
                            ? format(new Date(ticket?.dueDate), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => navigate(`/ticket/${ticket?._id}`)}
                        >
                          <FaEye className="text-primary text-base" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <div>No Tickets Available</div>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          style={{
            paddingTop: 10,
            paddingBottom: 6,
          }}
          component="div"
          rowsPerPageOptions={[]}
          rowsPerPage={10}
          count={tickets?.count}
          page={Number(currentPage) - 1 || 0}
          onPageChange={(e, page) => handlePageChange(e, page)}
          showFirstButton={true}
          showLastButton={true}
          labelDisplayedRows={({ from, to, count }) => {
            return `Showing:\u00A0\u00A0 ${from}–${to} of ${
              count !== -1 ? count : `more than ${to}`
            }`;
          }}
        />
      </Paper>
      <CreateTicketModal
        openTicketModal={openTicketModal}
        setOpenTicketModal={setOpenTicketModal}
      />
    </>
  );
}

export default Tickets;