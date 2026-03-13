/* =========================
   script.js
   CPU Scheduling Visualiser
========================= */

/* DOM references */

const tableBody = document.querySelector("#processTable tbody");
const btnAdd = document.getElementById("btnAdd");
const btnEdit = document.getElementById("btnEdit");
const btnRemove = document.getElementById("btnRemove");
const btnEvaluate = document.getElementById("btnEvaluate");
const btnVisualise = document.getElementById("btnVisualise");

const algoSelect = document.getElementById("algoSelect");
const quantumRow = document.getElementById("quantumRow");
const quantumInput = document.getElementById("quantumInput");

const resultsContent = document.getElementById("resultsContent");

/* =========================
   Read Processes
========================= */

function readProcessesFromTable(){

const rows = Array.from(tableBody.rows);

return rows.map(row=>({

pid:row.cells[0].innerText.trim(),

burst:parseInt(row.cells[1].innerText),

arrival:parseInt(row.cells[2].innerText),

priority:parseInt(row.cells[3].innerText),

originalBurst:parseInt(row.cells[1].innerText)

}));

}

/* =========================
   Validation
========================= */

function validateProcess(p){

if(!p.pid) return "Process ID empty";

if(p.burst < 0) return "Burst must be positive";

if(p.arrival < 0) return "Arrival must be positive";

if(p.priority < 0) return "Priority must be positive";

return null;

}

/* =========================
   Table Utilities
========================= */

function insertProcessRow(p){

const row = tableBody.insertRow();

row.insertCell(0).innerText = p.pid;
row.insertCell(1).innerText = p.burst;
row.insertCell(2).innerText = p.arrival;
row.insertCell(3).innerText = p.priority;

}

function findRowIndexByPid(pid){

for(let i=0;i<tableBody.rows.length;i++){

if(tableBody.rows[i].cells[0].innerText.trim()===pid)
return i;

}

return -1;

}

/* =========================
   Add Process
========================= */

btnAdd.addEventListener("click",()=>{

const pid = prompt("Enter Process ID");

if(pid===null) return;

const burst = prompt("Enter Burst Time");

if(burst===null) return;

const arrival = prompt("Enter Arrival Time","0");

if(arrival===null) return;

const priority = prompt("Enter Priority","1");

if(priority===null) return;

const p={

pid:pid.trim(),

burst:parseInt(burst),

arrival:parseInt(arrival),

priority:parseInt(priority)

};

const err=validateProcess(p);

if(err){

alert(err);

return;

}

if(findRowIndexByPid(p.pid)!==-1){

alert("PID already exists");

return;

}

insertProcessRow(p);

});

/* =========================
   Edit Process
========================= */

btnEdit.addEventListener("click",()=>{

const pid = prompt("Enter PID to edit");

if(pid===null) return;

const idx = findRowIndexByPid(pid.trim());

if(idx===-1){

alert("PID not found");

return;

}

const row=tableBody.rows[idx];

const burst = prompt("New Burst",row.cells[1].innerText);

if(burst===null) return;

const arrival = prompt("New Arrival",row.cells[2].innerText);

if(arrival===null) return;

const priority = prompt("New Priority",row.cells[3].innerText);

if(priority===null) return;

row.cells[1].innerText=burst;
row.cells[2].innerText=arrival;
row.cells[3].innerText=priority;

});

/* =========================
   Remove Process
========================= */

btnRemove.addEventListener("click",()=>{

const pid=prompt("Enter PID to remove");

if(pid===null) return;

const idx=findRowIndexByPid(pid.trim());

if(idx===-1){

alert("PID not found");

return;

}

tableBody.deleteRow(idx);

});

/* =========================
   RR Quantum Toggle
========================= */

algoSelect.addEventListener("change",()=>{

if(algoSelect.value==="RR")
quantumRow.style.display="flex";

else
quantumRow.style.display="none";

});

/* =========================
   Algorithms
========================= */

function evaluateFCFS(processes){

processes.sort((a,b)=>a.arrival-b.arrival);

let time=0;

let totalWT=0;
let totalTAT=0;

const results=[];

for(const p of processes){

if(time<p.arrival) time=p.arrival;

const completion=time+p.originalBurst;

const tat=completion-p.arrival;

const wt=tat-p.originalBurst;

results.push({pid:p.pid,waiting:wt,turnaround:tat});

totalWT+=wt;
totalTAT+=tat;

time=completion;

}

return{

perProcess:results,

avgWaiting:totalWT/processes.length,

avgTurnaround:totalTAT/processes.length

};

}

function evaluateSJF(processes){

processes.sort((a,b)=>a.originalBurst-b.originalBurst);

let time=0;

let totalWT=0;
let totalTAT=0;

const results=[];

for(const p of processes){

const completion=time+p.originalBurst;

const tat=completion;

const wt=tat-p.originalBurst;

results.push({pid:p.pid,waiting:wt,turnaround:tat});

totalWT+=wt;
totalTAT+=tat;

time=completion;

}

return{

perProcess:results,

avgWaiting:totalWT/processes.length,

avgTurnaround:totalTAT/processes.length

};

}

function evaluatePriority(processes){

processes.sort((a,b)=>a.priority-b.priority);

let time=0;

let totalWT=0;
let totalTAT=0;

const results=[];

for(const p of processes){

const completion=time+p.originalBurst;

const tat=completion;

const wt=tat-p.originalBurst;

results.push({pid:p.pid,waiting:wt,turnaround:tat});

totalWT+=wt;
totalTAT+=tat;

time=completion;

}

return{

perProcess:results,

avgWaiting:totalWT/processes.length,

avgTurnaround:totalTAT/processes.length

};

}

function evaluateRR(processes,quantum){

let queue=processes.map(p=>({...p,remaining:p.originalBurst}));

let time=0;

let totalWT=0;
let totalTAT=0;

const results=[];

while(queue.some(p=>p.remaining>0)){

for(const p of queue){

if(p.remaining>0){

let run=Math.min(quantum,p.remaining);

p.remaining-=run;

time+=run;

if(p.remaining===0){

const tat=time;

const wt=tat-p.originalBurst;

results.push({pid:p.pid,waiting:wt,turnaround:tat});

totalWT+=wt;
totalTAT+=tat;

}

}

}

}

return{

perProcess:results,

avgWaiting:totalWT/processes.length,

avgTurnaround:totalTAT/processes.length

};

}

/* =========================
   Evaluate Button
========================= */

btnEvaluate.addEventListener("click",()=>{

const algo=algoSelect.value;

const processes=readProcessesFromTable();

let quantum=parseInt(quantumInput.value);

let result;

if(algo==="FCFS")
result=evaluateFCFS(processes);

else if(algo==="SJF")
result=evaluateSJF(processes);

else if(algo==="PRIORITY")
result=evaluatePriority(processes);

else if(algo==="RR")
result=evaluateRR(processes,quantum);

renderResults(algo,result,processes,quantum);

});

/* =========================
   Render Results
========================= */

function renderResults(algo, result, processes, quantum) {

let calcSteps = "";
let resultsText = "";

result.perProcess.forEach(p => {

const proc = processes.find(x => x.pid == p.pid);

const arrival = proc.arrival;
const burst = proc.originalBurst;

const completion = arrival + p.turnaround;

calcSteps +=
`Process ${p.pid}
CT = ${completion}
TAT = CT - AT = ${completion} - ${arrival} = ${p.turnaround}
WT = TAT - BT = ${p.turnaround} - ${burst} = ${p.waiting}

`;

resultsText +=
`Process ${p.pid}  →  Waiting Time = ${p.waiting} | Turnaround Time = ${p.turnaround}\n`;

});

let explanation = "";

if(algo === "FCFS")
explanation =
`FCFS executes processes strictly in order of arrival.
The first process arriving gets the CPU first and runs until completion.
Later processes must wait even if they have shorter burst times.
This can lead to the convoy effect where small jobs wait behind large ones.`;

else if(algo === "SJF")
explanation =
`SJF chooses the process with the smallest burst time from the ready queue.
This usually minimizes average waiting time but can cause starvation
for processes with long burst times.`;

else if(algo === "PRIORITY")
explanation =
`Priority scheduling executes the process with the highest priority first.
Lower numeric value means higher priority in this system.
Lower priority processes may starve unless aging is implemented.`;

else if(algo === "RR")
explanation =
`Round Robin shares CPU time equally among processes using a time quantum.
Each process executes for a fixed time slice and returns to the queue
if it is not finished. This improves fairness and responsiveness.`;


let visualExplanation =
`The visualized blocks represent CPU execution order.
Each block corresponds to the amount of time a process occupies the CPU.

Block Width ∝ Burst Time (or time slice for Round Robin).

Example:
If P1 runs for 50 units, its block appears wider than P2 running for 30.

This timeline is essentially a graphical representation of the Gantt Chart
used in operating system scheduling analysis.`;


const formulaBlock = `
Formulas Used

Completion Time (CT)
CT = time when process finishes execution

Turnaround Time (TAT)
TAT = CT - Arrival Time

Waiting Time (WT)
WT = TAT - Burst Time

Average Waiting Time
= (Sum of all WT) / Number of processes

Average Turnaround Time
= (Sum of all TAT) / Number of processes
`;


const html = `

<div class="result-block">
<strong>Algorithm:</strong> ${algo}${algo === "RR" ? ` (Quantum = ${quantum})` : ""}
</div>

<div class="result-block">
<strong>Results</strong>
<pre>${resultsText}</pre>
</div>

<div class="result-block">
<strong>Formulas</strong>
<pre>${formulaBlock}</pre>
</div>

<div class="result-block">
<strong>Step-by-Step Calculations</strong>
<pre>${calcSteps}</pre>
</div>

<div class="result-block">
<strong>Average Metrics</strong>
<p>Average Waiting Time: <strong>${result.avgWaiting.toFixed(2)}</strong></p>
<p>Average Turnaround Time: <strong>${result.avgTurnaround.toFixed(2)}</strong></p>
</div>

<div class="result-block">
<strong>Algorithm Explanation</strong>
<p>${explanation}</p>
</div>

<div class="result-block">
<strong>Visualization Explanation</strong>
<p>${visualExplanation}</p>
</div>

`;

resultsContent.innerHTML = html;

}

/* =========================
   Visualizer
========================= */

btnVisualise.addEventListener("click",()=>{

const algo=algoSelect.value;

const processes=readProcessesFromTable();

let timeline=[];

if(algo==="FCFS")
processes.sort((a,b)=>a.arrival-b.arrival);

else if(algo==="SJF")
processes.sort((a,b)=>a.originalBurst-b.originalBurst);

else if(algo==="PRIORITY")
processes.sort((a,b)=>a.priority-b.priority);

else if(algo==="RR"){

let quantum=parseInt(quantumInput.value);

let queue=processes.map(p=>({...p,remaining:p.originalBurst}));

while(queue.some(p=>p.remaining>0)){

for(const p of queue){

if(p.remaining>0){

let run=Math.min(quantum,p.remaining);

timeline.push({pid:p.pid,time:run});

p.remaining-=run;

}

}

}

renderGantt(timeline);

return;

}

processes.forEach(p=>{

timeline.push({pid:p.pid,time:p.originalBurst});

});

renderGantt(timeline);

});

/* =========================
   Render Gantt Chart
========================= */

function renderGantt(timeline){

const chart=document.getElementById("ganttChart");

chart.innerHTML="";

timeline.forEach((step,index)=>{

const block=document.createElement("div");

block.className="gantt-block block"+((index%5)+1);

block.style.width=(step.time*3)+"px";

block.innerHTML="P"+step.pid+"<br>"+step.time;

chart.appendChild(block);

});

}