import { db } from "./firebase.js";
import {
  collection, addDoc, doc,
  getDoc, updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const costsCol = collection(db,"costs");

const costTable = document.getElementById("costTable");
const costModal = document.getElementById("costModal");

const newCostBtn = document.getElementById("newCostBtn");
const saveCostBtn = document.getElementById("saveCostBtn");
const closeCostBtn = document.getElementById("closeCostBtn");

const advanceContainer = document.getElementById("advanceContainer");
const finalContainer = document.getElementById("finalContainer");

let editId = null;

/* LOAD SUMMARY */
onSnapshot(costsCol,snap=>{
  costTable.innerHTML="";
  snap.forEach(d=>{
    const c=d.data();
    costTable.innerHTML+=`
      <tr>
        <td>${c.so}</td>
        <td>${c.totalCost}</td>
        <td>${c.ppcCost}</td>
        <td>${c.ecCost}</td>
        <td>
          <button onclick="editCost('${d.id}')">Edit</button>
        </td>
      </tr>
    `;
  });
});

/* OPEN NEW */
newCostBtn.onclick=()=>{
  editId=null;
  clearModal();
  costModal.style.display="flex";
};

/* CLOSE */
closeCostBtn.onclick=()=>costModal.style.display="none";

/* ADD ROWS */
function addRow(container,data={}){
  const row=document.createElement("div");
  row.className="expense-row";
  row.innerHTML=`
    <input placeholder="Expense Name" value="${data.name||""}">
    <input type="number" placeholder="Amount" value="${data.amount||""}">
  `;
  container.appendChild(row);
}

document.getElementById("addAdvance").onclick=()=>addRow(advanceContainer);
document.getElementById("addFinal").onclick=()=>addRow(finalContainer);

/* SAVE */
saveCostBtn.onclick=async()=>{

  const so=document.getElementById("soInput").value;
  const amount=Number(document.getElementById("amountInput").value);
  const cbmPPC=Number(document.getElementById("cbmPPCInput").value);
  const cbmEC=Number(document.getElementById("cbmECInput").value);

  const advanceCosts=[];
  const finalCosts=[];
  let advanceTotal=0;
  let finalTotal=0;

  advanceContainer.querySelectorAll(".expense-row").forEach(r=>{
    const name=r.children[0].value;
    const value=Number(r.children[1].value);
    if(value){
      advanceCosts.push({name,amount:value});
      advanceTotal+=value;
    }
  });

  finalContainer.querySelectorAll(".expense-row").forEach(r=>{
    const name=r.children[0].value;
    const value=Number(r.children[1].value);
    if(value){
      finalCosts.push({name,amount:value});
      finalTotal+=value;
    }
  });

  const totalCost=advanceTotal+finalTotal;
  const totalCBM=cbmPPC+cbmEC;

  const ppcCost= totalCBM>0 ? (totalCost/totalCBM)*cbmPPC : 0;
  const ecCost= totalCBM>0 ? (totalCost/totalCBM)*cbmEC : 0;

  const data={
    so,
    amount,
    cbmPPC,
    cbmEC,
    advanceCosts,
    finalCosts,
    advanceTotal,
    finalTotal,
    totalCost,
    ppcCost:ppcCost.toFixed(2),
    ecCost:ecCost.toFixed(2)
  };

  if(editId){
    await updateDoc(doc(db,"costs",editId),data);
  }else{
    await addDoc(costsCol,data);
  }

  costModal.style.display="none";
};

/* EDIT */
window.editCost=async(id)=>{
  const snap=await getDoc(doc(db,"costs",id));
  const c=snap.data();

  editId=id;
  clearModal();

  document.getElementById("soInput").value=c.so;
  document.getElementById("amountInput").value=c.amount;
  document.getElementById("cbmPPCInput").value=c.cbmPPC;
  document.getElementById("cbmECInput").value=c.cbmEC;

  c.advanceCosts.forEach(a=>addRow(advanceContainer,a));
  c.finalCosts.forEach(f=>addRow(finalContainer,f));

  costModal.style.display="flex";
};

function clearModal(){
  advanceContainer.innerHTML="";
  finalContainer.innerHTML="";
}
