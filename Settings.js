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
    TableRow,
  } from "@mui/material";
  import React, { useEffect, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import {
    deleteManager,
    getAllManagers,
  } from "../features/manager/managerSlice";
  import { FaPen, FaRegTrashAlt } from "react-icons/fa";
  import AddOrEditManagerModal from "../components/AddOrEditManagerModal";
  import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
  import {
    deleteDepartment,
    getAllDepartments,
  } from "../features/department/departmentSlice";
  import AddOrEditDepartmentModal from "../components/AddOrEditDepartmentModal";
  import { capitalizeFirstLetter } from "../helpers/utils";
  import { useSearchParams } from "react-router-dom";
  import { getAllUsers } from "../features/auth/authSlice";
  
  const Settings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
  
    const [isManagersVisible, setIsManagersVisible] = useState(
      searchParams.get("managerspage") == "true" ? true : false
    );
  
    const [openManagerModal, setOpenManagerModal] = useState(false);
    const [openDepartmentModal, setOpenDepartmentModal] = useState(false);
    const [selectData, setSelectData] = useState({ name: "", id: "" });
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
  
    const { departments } = useSelector((state) => state.departments);
  
    const { managers, isLoading } = useSelector((state) => state.managers);
  
    const { isLoading: departmentsLoading } = useSelector(
      (state) => state.departments
    );
  
    const dispatch = useDispatch();
  
    const columns = [
      [
        { id: "sno", label: "S No." },
        { id: "managerName", label: "Name" },
        { id: "managerEmail", label: "Email" },
        { id: "departments", label: "Departments" },
        { id: "action", label: "Action" },
      ],
      [
        { id: "sno", label: "S No." },
        { id: "departmentName", label: "Department Name" },
        { id: "action", label: "Action" },
      ],
    ];
  
    const tableLoader = () => {
      return [...new Array(5)].map((_, i) => (
        <TableRow key={i}>
          {[...new Array(8)].map((_, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ));
    };
  
    useEffect(() => {
      dispatch(getAllManagers());
      dispatch(getAllDepartments());
      dispatch(getAllUsers());
      setSelectData({ name: "", id: "" });
    }, []);
  
    const handleDelete = () => {
      dispatch(
        selectData?.name === "manager"
          ? deleteManager(selectData?.id)
          : deleteDepartment(selectData?.id)
      ).then(() => {
        dispatch(getAllManagers());
        dispatch(getAllDepartments());
        setSelectData({ name: "", id: "" });
      });
    };
  
    const handlePageChange = (val) => {
      if (val === "manager") {
        setIsManagersVisible(true);
        setSearchParams({
          ...Object.fromEntries(searchParams),
          managerspage: true,
        });
      } else {
        setIsManagersVisible(false);
        setSearchParams({
          ...Object.fromEntries(searchParams),
          managerspage: false,
        });
      }
    };
  
    return (
      <div>
        <h1 className="text-left mb-4 pl-2">Settings</h1>
        <div className="flex justify-between mb-3">
          <RadioGroup
            row
            name="row-radio-buttons-group divide-x"
            value="all"
            className="border border-gray-300 rounded-xl pl-4 w-[19rem]"
          >
            <FormControlLabel
              value="departments"
              control={<Radio />}
              label="Departments"
              checked={!isManagersVisible}
              onChange={() => handlePageChange("department")}
              className="border-r border-gray-300 pr-8"
            />
            <FormControlLabel
              value="managers"
              control={<Radio />}
              label="Managers"
              checked={isManagersVisible}
              onChange={() => handlePageChange("manager")}
            />
          </RadioGroup>
          <button
            className="btn bg-primary text-white"
            onClick={() => {
              isManagersVisible
                ? setOpenManagerModal(true)
                : setOpenDepartmentModal(true);
            }}
          >
            Add {isManagersVisible ? "Manager" : "Department"}
          </button>
        </div>
        <div>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {(isManagersVisible ? columns[0] : columns[1])?.map(
                      (column) => (
                        <TableCell key={column?.id} style={{ fontWeight: "600" }}>
                          {column.label}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading || departmentsLoading
                    ? tableLoader()
                    : isManagersVisible
                    ? managers?.map((manager, index) => (
                        <TableRow key={manager?._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {capitalizeFirstLetter(manager?.manager?.name)}
                          </TableCell>
                          <TableCell>
                            {manager?.manager?.email}
                          </TableCell>
                          <TableCell>
                            {manager?.departments
                              ?.map((el) => el?.name)
                              ?.sort((a, b) => a.localeCompare(b))
                              ?.map((name) => (
                                <>
                                  <span className="!px-4 !py-2 status text-lg !bg-primary font-bold">
                                    {capitalizeFirstLetter(name)}
                                  </span>{" "}
                                </>
                              ))}
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              <span className="cursor-pointer">
                                <FaPen
                                  className="text-lg text-primary"
                                  onClick={() => {
                                    setSelectData({
                                      name: "manager",
                                      id: manager?._id,
                                    });
                                    setOpenManagerModal(true);
                                  }}
                                />
                              </span>
                              <span className="ml-10 cursor-pointer ">
                                <FaRegTrashAlt
                                  className="text-lg text-red-600"
                                  onClick={() => {
                                    setSelectData({
                                      name: "manager",
                                      id: manager?._id,
                                    });
                                    setOpenDeleteModal({
                                      open: true,
                                      type: "manager",
                                    });
                                  }}
                                />
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : departments?.map((department, index) => (
                        <TableRow key={department?._id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{department?.name}</TableCell>
                          <TableCell>
                            <div className="flex">
                              <span className="cursor-pointer">
                                <FaPen
                                  className="text-lg text-primary"
                                  onClick={() => {
                                    setSelectData({
                                      name: "department",
                                      id: department?._id,
                                    });
                                    setOpenDepartmentModal(true);
                                  }}
                                />
                              </span>
                              <span className="ml-10 cursor-pointer ">
                                <FaRegTrashAlt
                                  className="text-lg text-red-600"
                                  onClick={() => {
                                    setSelectData({
                                      name: "department",
                                      id: department?._id,
                                    });
                                    setOpenDeleteModal({
                                      open: true,
                                      type: "department",
                                    });
                                  }}
                                />
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
        <AddOrEditManagerModal
          openModal={openManagerModal}
          setOpenModal={setOpenManagerModal}
          selectData={selectData}
          setSelectData={setSelectData}
        />
        <AddOrEditDepartmentModal
          openModal={openDepartmentModal}
          setOpenModal={setOpenDepartmentModal}
          selectData={selectData}
          setSelectData={setSelectData}
        />
        <ConfirmDeleteModal
          openDeleteModal={openDeleteModal}
          setOpenDeleteModal={setOpenDeleteModal}
          handleDelete={handleDelete}
          setSelectData={setSelectData}
        />
      </div>
    );
  };
  
  export default Settings;
  