import { dataQuery, loginQuery, projectTimelineXP, xpQuery, skills } from "./query.js"
function Student() {
    this.id = null
    this.login = null
    this.email = null
    this.token = null
    this.name = null
    this.cohort = null
    this.module = null
}

export async function createStudentObject(accessToken) {
    let studentID = null;
    try {
        studentID = parseInt(JSON.parse(atob(accessToken.split(".")[1])).sub);
    } catch (e) {
        if (e instanceof SyntaxError) {
            console.error("Failed to parse token: Invalid JSON format", e);
        } else if (e instanceof TypeError) {
            console.error("Failed to parse token: Invalid token structure", e);
        } else {
            console.error("Unknown error while parsing token", e);
        }
        return null;
    }

    let student = new Student();
    student.token = accessToken;
    student.id = studentID;
    try {
        await getStudentData(student);
    } catch (e) {
        console.error("Error fetching student data", e);
        return null;
    }

    student.module = student.cohort;
    switch (student.cohort) {
        case 20:
            student.cohort = 1;
            break;
        case 72:
            student.cohort = 2;
            break;
        case 250:
            student.cohort = 3;
            break;
        default:
            student.cohort = "New Cohort";
    }
    return student;
}

async function getStudentData(student) {
    try {
        await Promise.all([
            getStudentInfo(student),
            getXp(student),
            getProjects(student),
            getSkills(student)
        ]);
    } catch (e) {
        console.error("Error fetching student data", e);
        throw e;
    }
}

async function getStudentInfo(student) {
    const queryResponse = await dataQuery(student.token, loginQuery(student))
    student.id = queryResponse.data.user[0].id
    student.login = queryResponse.data.user[0].login
    student.email = queryResponse.data.user[0].email
    student.name = `${queryResponse.data.user[0].firstName} ${queryResponse.data.user[0].lastName}`
    student.cohort = queryResponse.data.user[0].events[0].event.id
}

async function getXp(student) {
    const queryResponse = await dataQuery(student.token, xpQuery(student))
    student.auditRatio = Number(queryResponse.data.user[0].auditRatio.toFixed(3))
    student.totalXp = queryResponse.data.user[0].totalUp
}

async function getProjects(student) {
    const queryResponse = await dataQuery(student.token, projectTimelineXP(student));
    student.projects = [];
    
    queryResponse.data.user[0].transactions.forEach(element => {
        const pathParts = element.pathByPath.path.split('/');
        const name = toTitleCase(pathParts[pathParts.length - 1].replace(/-/g, ' '));
        const endDate = new Date(element.createdAt).toISOString().split('T')[0];
        const xp = element.amount;
        
        student.projects.push({ name, endDate, xp });
    });
}

async function getSkills(student) {
    const queryResponse = await dataQuery(student.token, skills(student));
    student.skills = [];

    queryResponse.data.user[0].transactions.forEach(element => {
        if (element.type.startsWith("skill_")) {
            const skillName = element.type
                .replace("skill_", "")
                .replace(/-/g, " ")
                .toUpperCase();
            const progress = element.amount;
            student.skills.push({ progress, skillName});
        }
    });
}


function toTitleCase(str) {
    return str.replace(/-/g, ' ').replace(/\w\S*/g, function(input) {
        return input.charAt(0).toUpperCase() + input.slice(1, input.length).toLowerCase();
    });
}