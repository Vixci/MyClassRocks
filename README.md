# MyClassRocks
My Class Rocks allows to create aggregated views containing stats and charts from the classroom data. 
These views are useful to get an overview at a glance of  the teacher’s courses, course work, grades and aggregated stats. Most of these stats and charts are not surfaced in the Classroom UI, so they can add value for teachers who are tracking these metrics.
The add-on has two main functions:
## Generation of course level aggregated stats. 
All courses in the teacher's classroom are imported in a single sheet entitled “Course Summary”. For each course it lists the course ID and name and calculates the following: number of students enrolled, homework completion rate, average completion time (days), average grading time (days), the final grades rate, as well as the average, maximum, minimum and median grades. The calculated stats take draft grades into account. 
## Generation of course work level aggregated stats and charts. 
For each of the courses in the teacher’s classroom, a new sheet with the same name as the course is inserted. In each of these sheets there are three tables and a chart:
1. A table containing all the course work for the current course. For each course work, it calculates the following: homework completion rate, average completion time (days), average grading time (days), the fina grades rate (the percentage), as well as average, maximum, minimum and median grades. 
2. A table containing  the average grades for all the students enrolled in the current course. If a student did not turn in the submission for an assigned coursework, it counts as 0. If there is no course work assigned, then the grade is “N/A”. It takes into account the draft grades; if one or more grades are draft, then the row displays NO in the Is Grade Final column.
3. A table containing: course average grade, course median grade and course standard deviation
4. A histogram bar chart with the grade distribution for the current course
## Bulk deletion of the previously inserted sheets. 
The add on provides 2 buttons that deletes in bulk the course summary sheet or the individual course sheets that were added via the add on. Note that sheets are identified by name. If you changed the name in the meantime, they would have to be deleted manually.

## Scopes
My Class Rocks uses	https://www.googleapis.com/auth/spreadsheets to  edit, create, and delete spreadsheets in Google Drive. This is essential for the app’s purpose.

It uses https://www.googleapis.com/auth/classroom.courses to access the courses in which the current user is a teacher. It needs to display the course names in a spreadsheet, as well as stats about the course.

https://www.googleapis.com/auth/classroom.coursework.students

It uses https://www.googleapis.com/auth/classroom.rosters to access the course work from the above courses and the students enrolled in those courses. It displays the titles of the coursework, as well as basic stats and grade averages.

It uses https://www.googleapis.com/auth/classroom.profile.emails and https://www.googleapis.com/auth/classroom.profile.photos to access the  profiles for the students enrolled in the teacher’s classes. It accesses the full names and displays them in the spreadsheet.
