import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { courseSubjectUrl, goalsByCourse } from "../../constants/appConfig";
import { Cookies as Cookie } from "react-cookie";
import fetch from "./../../../src/app/data/utils/fetch";
import { default as Link } from "./../containers/ConnectedLink";
import { useHistory } from "react-router";
import { getUserId,getSelectedcategoryId } from "../data/utils/helpers";

/**
 * 
 * Common Header Component 
 */
const CommonSubjectHeader = (props) => {
  const history = useHistory(); 
  const cookie = new Cookie();
  const selected_page = props.pageId;
  const [fetchGoalsByCourse, setFetchGoalsByCourse] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState([]);
  const [allSelectedPlanIds, setAllSelectedPlanIds] = useState([]);
  const [subjectData, setSubjectData] = useState({
    selectedCourse: selected_page,
    subjectName: "",
    courseSubjects: [],
  });

  let categoryId = getSelectedcategoryId();

  useEffect(() => {
    fetchCourseList();
  }, [categoryId,selected_page]); // only if categoryId,selected_page changes

/**
 * GET /getExamsByCategoryId
 * Common subject header page.
 */
  const fetchCourseList = () => {
    const goalObj = {
      categoryId: categoryId,
      userId: getUserId(),
    };
    setFetchGoalsByCourse([]);
    fetch(`${goalsByCourse}`, "POST", goalObj).then((res) => {
      setGoals(res.response);
    });
  };

  /**
   * 
   * All selected Exams 
   */
  const setGoals = (response) => {
    let allSelectedIds = [];
    let exmary = [];
    let examName = "All Subjects";
    let isExamMatched = false;
    response.map((exam) => {
      if (exam.isSelected === true && exmary.indexOf(exam.examStageId) === -1) {
        exmary.push(exam);
        allSelectedIds.push(exam.examStageId);
        if (exam.examStageId == selected_page) {
          examName = exam.examStageName;
          isExamMatched = true
        }
      }
    });
    if(!allSelectedIds.length){
      history.push('/gold/goals')
    }

    if(selected_page == "all" && allSelectedIds.length == 1){
      history.push(`/gold/subjects/${exmary[0].examStageId}`)
    }

    if(!isExamMatched && selected_page !== "all"){
      history.push(`/gold/subjects/${exmary[0].examStageId}`)
    }
  
    props.getName(examName);
    setSelectedPlan(exmary);
    if (props.isAbout != undefined) {
      props.getSelectedExams(exmary);
    }
   
    let courseIds = selected_page === "all" ? allSelectedIds : [selected_page];
    courseSubjects(courseIds);
    setAllSelectedPlanIds(allSelectedIds);
  };

/**
 * GET /getSubjectsByExamIds
 * Common subject header page.
 */
  const courseSubjects = (courseIds, subjectName) => {
    const goalObj = {
      categoryId: categoryId,
      userId: getUserId(),
      examStageIds: courseIds,
    };
    fetch(`${courseSubjectUrl}`, "POST", goalObj).then((res) => {
      let finalsubjectArray = getUnique(res.response);
      let courseSel = courseIds.length > 1 ? "" : courseIds[0];
      setSubjectData({
        courseSubjects: finalsubjectArray,
        selectedCourse: courseSel,
        subjectName: subjectName,
      });
      props.CommonDataHandler(finalsubjectArray);
      props.getLoadingStatus(false);
    });
  };

  /**
   * 
   * Getting Distinct array values
   */
  const getUnique = (array) => {
    let finalsubjectArray = [];
    let subjectArray = array;
    let uniqueNames = subjectArray.reduce(function (r, a) {
      r[a.subjectName] = r[a.subjectName] || [];
      r[a.subjectName].push(a);
      return r;
    }, Object.create(null));
    Object.keys(uniqueNames).map((a) => {
      const currentArray = uniqueNames[a];
      const xMax = Math.max.apply(
        Math,
        currentArray.map(function (o) {
          return o.totalTopics;
        })
      );
      const currentObj = currentArray.filter(function (o) {
        return o.totalTopics === xMax;
      })[0];
      finalsubjectArray.push(currentObj);
    });
    return finalsubjectArray;
  };
  /**
   * 
   * Category Selection
   */
  const markSelected = (courseId, subjectName) => {
    props.getName(subjectName || "All Subjects");
    if (props.isAbout != undefined) {
      props.getSelectedExams(selectedPlan);
    }
    if (courseId.length > 0) {
      courseSubjects(courseId, subjectName);
    } else {
      courseSubjects([courseId], subjectName);
    }
  };
  return (
    <div className="exam-menu-bottom-line">
      <div className="container-padding">
        {selectedPlan && (
          <div className="exam-menu-wrapper">
            <ul>
              {selectedPlan.length > 1 && (
                <li onClick={() => markSelected(allSelectedPlanIds, "")}>
                  <Link
                    to={`/gold/subjects/all`}
                    className={`${subjectData.selectedCourse === "" ? "selected" : ""
                      }`}
                  >
                    All Selected Exams
                  </Link>
                </li>
              )}
              {selectedPlan.map((item, index) => {
                return (
                  <li
                    onClick={() =>
                      markSelected(item.examStageId, item.examStageName)
                    }
                  >
                    <Link
                      to={`/gold/subjects/${item.examStageId}`}
                      className={
                        selected_page == item.examStageId &&
                        "selected"
                      }
                    >
                      {item.examStageName}
                    </Link>
                  </li>
                );
              })}
              {selectedPlan && selectedPlan.length > 0 && (
                <li>
                  <Link to={`/gold/goals`}>Manage Exams</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  header: state.header,
});

export default connect(mapStateToProps, null)(CommonSubjectHeader);
