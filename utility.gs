/**
 * Gets all the courses from the Classroom account.
 */
function getAllCourses() {
  var pageToken = null;
  var optionalArgs = {
    teacherId : "me",
    pageToken: pageToken,
    pageSize: 100
  };
  var courses = [];
  
  while (true) {
    var response = Classroom.Courses.list(optionalArgs);
    courses = courses.concat(response.courses);
    if (!pageToken) {
       break;
    }
  }
  return courses;
}

/**
 * Gets all the course work associated with a course.
 */
function getAllCourseWork(courseId) {
  var pageToken = null;
  var optionalArgs = {
    pageToken: pageToken,
    pageSize: 100
  };
  var courseWork = [];
  //var response = Classroom.Courses.CourseWork.list(courseId);
  while (true) {
    var response = Classroom.Courses.CourseWork.list(courseId, optionalArgs);
    courseWork = courseWork.concat(response.courseWork);
    if (!pageToken) {
       break;
    }
  }
  courseWork = response.courseWork;
  if (courseWork && courseWork.length > 0) {
  Logger.log("coursework for course %s, length %s", courseId, courseWork.length);
  for (var i = 0; i < courseWork.length; i++) {
    Logger.log(courseWork[i].title);
  }}
  return courseWork;
}

/**
 * Deletes all individual course sheets.
 */
function deleteIndividualSheets() {
  var classroomSS = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = classroomSS.getSheets();
  
  if (sheets.length <= 1) return "Cannot delete the last sheet";
  
  var courses = getAllCourses();
  
  messageToReturn = "Done.";
  
  if (courses && courses.length > 0) {
    for (i = 0; i < courses.length; i++) {
      sheetToDelete = classroomSS.getSheetByName(courses[i].name);
      if (sheetToDelete != null) {
        classroomSS.deleteSheet(sheetToDelete);
      } else {
        messageToReturn = "One or more sheets were not found."
      }
    }
    return messageToReturn;
  } else {
    return "No courses in classroom.";
  }
}

/**
 * Deletes the course summary sheet.
 */
function deleteCourseSummarySheet() {
  var classroomSS = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = classroomSS.getSheets();
  
  if (sheets.length <= 1) return "Cannot delete the last sheet";
  
  sheetToDelete = classroomSS.getSheetByName("Course Summary");
  if (sheetToDelete != null) {
    classroomSS.deleteSheet(sheetToDelete);
    return "Done.";
  } else {
     return "Sheet does not exist.";
  }
}

/** 
 * Creates a sheet in the given spreadsheet with the given name.
 */
function createSheet(classroomSS, name) {
  var courseSheet = classroomSS.getSheetByName(name);
  if (courseSheet != null) {
    courseSheet.clear();
    var charts = courseSheet.getCharts();
      for (var i in charts) {
        courseSheet.removeChart(charts[i]);
       }
  }
  else {
    courseSheet = classroomSS.insertSheet();
    courseSheet.setName(name);
  }
  return courseSheet;
}

/** 
 * Count the rate at which the students submitted submissions for a course.
 */
function getSubmissionRate(courseId, courseWorkId) {
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  
  var total = 0;
  var totalTurned = 0;
  
  var submissions = response.studentSubmissions;
  if (submissions && submissions.length > 0) {
    for (j = 0; j < submissions.length; j++) {
      if (submissions[j].state == "TURNED_IN" || submissions[j].state == "RETURNED") {
        totalTurned++;
      }
      total++;
    }
  }
  if (total == 0) return "N/A";
  var rate = Math.round(totalTurned*100/total) + "%";
  return rate;
}

/** 
 * get median time of submission from when the coursework is created for a course.
 */
function getAverageSubmissionTime(courseId, courseWorkId) {
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var totalTime = 0;
  var totalTurned = 0;
  
  var submissions = response.studentSubmissions;
  if (submissions && submissions.length > 0) {
    for (var j = 0; j < submissions.length; j++) {
      if (submissions[j].state == "TURNED_IN" || submissions[j].state == "RETURNED") {
        var timeDiff = 0;
        var timeTurned = 0;
        var timeCreated = new Date(submissions[j].creationTime);
        totalTurned++;
        var submissionHistory = submissions[j].submissionHistory;
        if (submissionHistory && submissionHistory.length > 0) {
          for (z = 0; z < submissionHistory.length; z++) {
            if (submissionHistory[z].gradeHistory) {
              break;
            }
            if (submissionHistory[z].stateHistory.state == "TURNED_IN") {
              timeTurned = new Date(submissionHistory[z].stateHistory.stateTimestamp);
            }
          }
          
          if (timeTurned != 0) {
            timeDiff = ((timeTurned.getTime() - timeCreated.getTime()) / (1000 * 60 * 60 * 24));
            totalTime = totalTime + timeDiff;
          }
        }
      }
    }
  }
  if (totalTurned == 0) return "N/A";
  return Math.round(totalTime/totalTurned);
}

/** 
 * get median time of grading from when submission is turned in to when it is graded
 */
function getAverageGradeTime(courseId, courseWorkId) {
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var totalTime = 0;
  var totalTurned = 0;
  
  var submissions = response.studentSubmissions;
  if (submissions && submissions.length > 0) {
    for (var j = 0; j < submissions.length; j++) {
      if (submissions[j].state == "TURNED_IN" || submissions[j].state == "RETURNED") {
        var timeDiff = 0;
        var timeGraded = 0;
        var timeTurned = 0;
        totalTurned++;
        var submissionHistory = submissions[j].submissionHistory;
        if (submissionHistory && submissionHistory.length > 0) {
          for (z = 0; z < submissionHistory.length; z++) {
            if (submissionHistory[z].stateHistory && submissionHistory[z].stateHistory.state == "TURNED_IN") {
              timeTurned = new Date(submissionHistory[z].stateHistory.stateTimestamp);
            }
            if (submissionHistory[z].gradeHistory) {
              timeGraded = new Date(submissionHistory[z].gradeHistory.gradeTimestamp);
            }
          }
          if (timeGraded != 0 && timeTurned != 0) {
            timeDiff = ((timeGraded.getTime() - timeTurned.getTime()) / (1000 * 60 * 60 * 24));
            totalTime = totalTime + timeDiff;
          }
        }
      }
    }
  }
  if (totalTurned == 0) return "N/A";
  var median = Math.round(totalTime/totalTurned);
  return median;
}


/** 
 * get average grade for a course
 */
function getAverageGrade(courseId, courseWorkId) {
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var submissions = response.studentSubmissions;
  
  var total = 0;
  
  if (submissions && submissions.length > 0) {
    for (var i = 0; i < submissions.length; i++) {
      if (submissions[i].assignedGrade) {
        total = total + submissions[i].assignedGrade;
      }
      else if (submissions[i].draftGrade) {
        total = total + submissions[i].draftGrade;
      }
    }
    
    return Math.round((total/submissions.length * 100))/100;
    
  } else {
     return "N/A";
  }
}

/** 
 * Gets average student grade for a course.
 */
function getAverageStudentGrade(courseId, courseWork, studentId) {
  var optionalArgs = {
    userId: studentId
  };
  var total = 0; 
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, "-", optionalArgs);
  var submissions = response.studentSubmissions;
  
  if (courseWork && courseWork.length > 0) {
    if (submissions && submissions.length > 0) {
      for (t = 0; t < submissions.length; t++) {
        if (submissions[t].assignedGrade) {
          total = total + submissions[t].assignedGrade;
        }
        else if (submissions[t].draftGrade) {
          total = total + submissions[t].draftGrade;
        }
      }
      return Math.round((total/courseWork.length * 100))/100;
    } else {
      return 0;
    }
    
  } else {
    return 'N/A';
  }
}

/** 
 * Gets maximum student grade for a course.
 */
function getMaximumGrade(courseId, courseWorkId) {
  var max = 0; 
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var submissions = response.studentSubmissions;
  
  if (submissions && submissions.length > 0) {
    for (t = 0; t < submissions.length; t++) {
      if (submissions[t].assignedGrade) {
        if (submissions[t].assignedGrade > max) max = submissions[t].assignedGrade;
      }
      else if (submissions[t].draftGrade) {
        if (submissions[t].draftGrade > max) max = submissions[t].draftGrade;
      }
    }
    return max;
  }
  else {
    return "N/A";
  }
}

/** 
 * Gets minimum student grade for a course.
 */
function getMinimumGrade(courseId, courseWorkId) {
  var min = 0; 
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var submissions = response.studentSubmissions;
  
  if (submissions && submissions.length > 0) {
    for (t = 0; t < submissions.length; t++) {
      if (submissions[t].assignedGrade) {
        if (submissions[t].assignedGrade < min) min = submissions[t].assignedGrade;
      }
      else if (submissions[t].draftGrade) {
        if (submissions[t].draftGrade < min) min = submissions[t].draftGrade;
      }
    }
    return min;
  }
  else {
    return "N/A";
  }
}

/** 
 * Gets median student grade for a course
 */
function getMedianGrade(courseId, courseWorkId) {
  var grades = []; 
  
  var response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var submissions = response.studentSubmissions;
  
  if (submissions && submissions.length > 0) {
    for (t = 0; t < submissions.length; t++) {
      if (submissions[t].assignedGrade) {
        grades.push(submissions[t].assignedGrade);
      }
      else if (submissions[t].draftGrade) {
        grades.push(submissions[t].draftGrade);
      }
    }
    grades.sort();
    var median = 0;
    var numLength = grades.length;
    
    if (numLength % 2 === 0) {
        median = (grades[numLength / 2 - 1] + grades[numLength / 2]) / 2;
    } else {
        median = grades[(numLength - 1) / 2];
    }
    
    return median;
  }
  else {
    return "N/A";
  }
}

/**
 * Formats the header of the given sheet with the given range.
 */
function formatHeader(sheet, headerRowRange) {
    var rangeList = sheet.getRangeList([headerRowRange]);
    rangeList.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    rangeList.setBackground("#c2dbed");
    rangeList.setFontColor("#212b33");
    rangeList.setBorder(true, true, true, true, true, true, '#324d63', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    rangeList.setHorizontalAlignment("center");
    rangeList.setVerticalAlignment("middle");
}

/**
 * Formats the rows in the table.
 */
function formatTableRows(sheet, rowsRange) {
  var rangeList = sheet.getRangeList([rowsRange]);
  rangeList.setVerticalAlignment("middle");
  rangeList.setFontColor("#212b33");
  rangeList.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  rangeList.setBorder(true, true, true, true, true, false, '#324d63', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.autoResizeColumns(1, 1);
}
