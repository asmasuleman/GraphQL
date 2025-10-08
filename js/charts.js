export function renderCharts(studentData) {
    createXPProgressChart(studentData);
    createSkillsChart(studentData);
}
// XP Progress chart
function createXPProgressChart(studentData) {
    const container = document.getElementById('xpProgressChart');
    if (!container) return;

    const projects = studentData.projects || [];
    // Sort projects by date
    const sortedProjects = [...projects].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    
    let cumulativeXP = 0;
    const data = sortedProjects.map(project => {
        cumulativeXP += project.xp;
        return {
            name: project.name,
            xp: project.xp,
            cumulativeXP: cumulativeXP,
            date: project.endDate
        };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "250");
    svg.classList.add("graph-svg");

    if (data.length > 0) {
        const maxXP = Math.max(...data.map(d => d.cumulativeXP));
        const padding = 40;
        const chartWidth = 400 - (2 * padding);
        const chartHeight = 180 - (2 * padding);

        // X and Y axes
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding.toString());
        xAxis.setAttribute("y1", (chartHeight + padding).toString());
        xAxis.setAttribute("x2", (chartWidth + padding).toString());
        xAxis.setAttribute("y2", (chartHeight + padding).toString());
        xAxis.setAttribute("stroke", "#ccc");
        xAxis.setAttribute("stroke-width", "1");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding.toString());
        yAxis.setAttribute("y1", padding.toString());
        yAxis.setAttribute("x2", padding.toString());
        yAxis.setAttribute("y2", (chartHeight + padding).toString());
        yAxis.setAttribute("stroke", "#ccc");
        yAxis.setAttribute("stroke-width", "1");
        svg.appendChild(yAxis);

        // Line
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - (d.cumulativeXP / maxXP) * chartHeight;
            return `${x},${y}`;
        }).join(" ");

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", points);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", "#667eea");
        polyline.setAttribute("stroke-width", "3");
        polyline.setAttribute("stroke-linejoin", "round");
        polyline.setAttribute("stroke-linecap", "round");
        svg.appendChild(polyline);

        // Points
        data.forEach((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - (d.cumulativeXP / maxXP) * chartHeight;
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "4");
            circle.setAttribute("fill", "#764ba2");
            circle.setAttribute("class", "graph-point");
            
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${d.name}\nXP: ${d.xp}\nCumulative: ${d.cumulativeXP}\nDate: ${d.date}`;
            circle.appendChild(title);
            
            svg.appendChild(circle);
        });

        // Y-axis labels
        const yLabel1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel1.setAttribute("x", padding - 5);
        yLabel1.setAttribute("y", padding);
        yLabel1.setAttribute("text-anchor", "end");
        yLabel1.setAttribute("font-size", "10");
        yLabel1.setAttribute("fill", "#666");
        yLabel1.textContent = maxXP.toLocaleString();
        svg.appendChild(yLabel1);

        const yLabel2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel2.setAttribute("x", padding - 5);
        yLabel2.setAttribute("y", chartHeight + padding);
        yLabel2.setAttribute("text-anchor", "end");
        yLabel2.setAttribute("font-size", "10");
        yLabel2.setAttribute("fill", "#666");
        yLabel2.textContent = "0";
        svg.appendChild(yLabel2);

    } else {
        const noDataText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        noDataText.setAttribute("x", "50%");
        noDataText.setAttribute("y", "50%");
        noDataText.setAttribute("text-anchor", "middle");
        noDataText.setAttribute("fill", "#666");
        noDataText.textContent = "No project data available";
        svg.appendChild(noDataText);
    }

    container.innerHTML = '';
    container.appendChild(svg);
}

//skills
function createSkillsChart(studentData) {
    const container = document.getElementById('skillsChart');
    if (!container) return;

    const skills = studentData.skills || [];
    const topSkills = skills
        .filter(skill => skill.progress > 0)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 6);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "250");
    svg.classList.add("graph-svg");

    if (topSkills.length > 0) {
        const maxProgress = Math.max(...topSkills.map(s => s.progress));
        const barWidth = 280;
        const barHeight = 20;
        const spacing = 30;
        const startY = 40;

        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", "20");
        title.setAttribute("y", "20");
        title.setAttribute("font-size", "12");
        title.setAttribute("font-weight", "bold");
        title.setAttribute("fill", "#333");
        title.textContent = "Skill Progress";
        svg.appendChild(title);

        topSkills.forEach((skill, index) => {
            const y = startY + index * spacing;
            const progressWidth = (skill.progress / maxProgress) * barWidth;

            // Background
            const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bgRect.setAttribute("x", "20");
            bgRect.setAttribute("y", y);
            bgRect.setAttribute("width", barWidth.toString());
            bgRect.setAttribute("height", barHeight.toString());
            bgRect.setAttribute("fill", "#f8f9fa");
            bgRect.setAttribute("rx", "10");
            bgRect.setAttribute("stroke", "#e9ecef");
            bgRect.setAttribute("stroke-width", "1");
            svg.appendChild(bgRect);

            // Progress
            const progressRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            progressRect.setAttribute("x", "20");
            progressRect.setAttribute("y", y);
            progressRect.setAttribute("width", progressWidth.toString());
            progressRect.setAttribute("height", barHeight.toString());
            progressRect.setAttribute("fill", "#667eea");
            progressRect.setAttribute("rx", "10");
            svg.appendChild(progressRect);

            //skills Name
            const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            nameText.setAttribute("x", "25");
            nameText.setAttribute("y", y + 14);
            nameText.setAttribute("font-size", "11");
            nameText.setAttribute("font-weight", "bold");
            nameText.setAttribute("fill", "white");
            
            let displayName = skill.skillName;
            if (displayName.length > 20) {
                displayName = displayName.substring(0, 18) + '...';
            }
            nameText.textContent = displayName;
            svg.appendChild(nameText);

            // progress Value inside bar
            if (progressWidth > 50) {
                const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                valueText.setAttribute("x", (20 + progressWidth - 25).toString());
                valueText.setAttribute("y", y + 14);
                valueText.setAttribute("font-size", "10");
                valueText.setAttribute("font-weight", "bold");
                valueText.setAttribute("fill", "white");
                valueText.setAttribute("text-anchor", "end");
                valueText.textContent = skill.progress;
                svg.appendChild(valueText);
            }
        });
    } else {
        const noDataText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        noDataText.setAttribute("x", "50%");
        noDataText.setAttribute("y", "50%");
        noDataText.setAttribute("text-anchor", "middle");
        noDataText.setAttribute("fill", "#666");
        noDataText.textContent = "No skills data available";
        svg.appendChild(noDataText);
    }

    container.innerHTML = '';
    container.appendChild(svg);
}