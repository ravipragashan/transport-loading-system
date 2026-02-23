import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const recordsCol = collection(db,"records");
const costCol = collection(db,"transport_costs");

const soSelect = document.getElementById("soSelect");
const expenseContainer = document.getElementById("expenseContainer");

const addExpenseBtn = document.getElementById("addExpenseBtn");
const saveCostBtn = document.getElementById("saveCostBtn");

let selectedRecordId = null;
let existingCostId = null;

/* LOAD RECORDS */
onSnapshot(recordsCol, snap=>{
  soSelect.innerHTML="";
  snap.forEach(d=>{
    const r=d.data();
    soSelect.innerHTML+=`<option value="${d.id}">${r.so}</option>`;
  });
});

/* ADD EXPENSE ROW */
addExpenseBtn.onclick=()=>{
  const div=document.createElement("div");
  div.className="expense-row";
  div.innerHTML=`
    <input placeholder="Expense Name">
    <input type="number" placeholder="Amount">
  `;
  expenseContainer.appendChild(div);
};

/* LIVE CALCULATION */
document.body.addEventListener("input", calculate);

function calculate(){

  const amount = Number(document.getElementById("amount").value);
  const cbmPPC = Number(document.getElementById("cbmPPC").value);
  const cbmEC = Number(document.getElementById("cbmEC").value);

  let total=0;
  const expenses=[];

  document.querySelectorAll(".expense-row").forEach(row=>{
    const name=row.children[0].value;
    const val=Number(row.children[1].value);
    if(name && val){
      total+=val;
      expenses.push({title:name,amount:val});
    }
  });

  const totalCBM=cbmPPC+cbmEC;
  if(totalCBM===0) return;

  const costPerCBM=total/totalCBM;

  const ppcCost=costPerCBM*cbmPPC;
  const ecCost=costPerCBM*cbmEC;

  const profit=amount-total;

  document.getElementById("grandTotal").innerText=total;
  document.getElementById("ppcCost").innerText=ppcCost.toFixed(2);
  document.getElementById("ecCost").innerText=ecCost.toFixed(2);
  document.getElementById("profit").innerText=profit.toFixed(2);

  return {expenses,total,ppcCost,ecCost,profit};
}

/* SAVE */
saveCostBtn.onclick=async()=>{

  selectedRecordId=soSelect.value;
  const soText=soSelect.options[soSelect.selectedIndex].text;

  const result=calculate();
  if(!result) return;

  const data={
    recordId:selectedRecordId,
    so:soText,
    amount:Number(document.getElementById("amount").value),
    cbmPPC:Number(document.getElementById("cbmPPC").value),
    cbmEC:Number(document.getElementById("cbmEC").value),
    expenses:result.expenses,
    grandTotal:result.total,
    ppcCost:result.ppcCost,
    ecCost:result.ecCost,
    profit:result.profit
  };

  const q=query(costCol,where("recordId","==",selectedRecordId));
  const snap=await getDocs(q);

  if(!snap.empty){
    await updateDoc(doc(db,"transport_costs",snap.docs[0].id),data);
  }else{
    await addDoc(costCol,data);
  }

  alert("Saved Successfully");
};
