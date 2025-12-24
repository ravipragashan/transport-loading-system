let records = JSON.parse(localStorage.getItem("records")) || [];
let contacts = JSON.parse(localStorage.getItem("contacts")) || {driver:[],helper:[]};
let editRecIndex=null, editContactIndex=null;
let tempDocs=[];

/* ---------- CONTACTS ---------- */
function saveContact(){
  const type=contactType.value;
  if(!contactName.value||!contactPhone.value)return;

  if(editContactIndex===null){
    contacts[type].push({name:contactName.value,phone:contactPhone.value});
  } else {
    contacts[type][editContactIndex]={name:contactName.value,phone:contactPhone.value};
  }

  localStorage.setItem("contacts",JSON.stringify(contacts));
  editContactIndex=null;
  contactName.value=contactPhone.value="";
  renderContacts(); loadContacts();
}

function renderContacts(){
  contactTable.innerHTML="";
  contacts[contactType.value].forEach((c,i)=>{
    contactTable.innerHTML+=`
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>
          <button onclick="editContact(${i})">✏️</button>
          <button onclick="deleteContact(${i})">❌</button>
        </td>
      </tr>`;
  });
}

function editContact(i){
  const c=contacts[contactType.value][i];
  contactName.value=c.name;
  contactPhone.value=c.phone;
  editContactIndex=i;
}

function deleteContact(i){
  contacts[contactType.value].splice(i,1);
  localStorage.setItem("contacts",JSON.stringify(contacts));
  renderContacts(); loadContacts();
}

function loadContacts(){
  driverSelect.innerHTML=contacts.driver.map(d=>`<option>${d.name}|${d.phone}</option>`).join("");
  helperSelect.innerHTML=contacts.helper.map(h=>`<option>${h.name}|${h.phone}</option>`).join("");
}

/* ---------- RECORDS ---------- */
docInput.onchange=()=>{
  [...docInput.files].forEach(f=>tempDocs.push(f.name));
  renderDocs();
};

function renderDocs(){
  docList.innerHTML="";
  tempDocs.forEach((d,i)=>{
    docList.innerHTML+=`<li>${d} <button onclick="removeDoc(${i})">❌</button></li>`;
  });
}

function removeDoc(i){
  tempDocs.splice(i,1);
  renderDocs();
}

recordForm.onsubmit=e=>{
  e.preventDefault();
  const [dn,dp]=driverSelect.value.split("|");
  const [hn,hp]=helperSelect.value.split("|");

  const rec={
    so:soNumber.value,
    soNum:+soNumber.value.replace(/\D/g,""),
    lorry:lorryNumber.value,
    driver:dn, dPhone:dp,
    helper:hn, hPhone:hp,
    start:startDate.value,
    end:endDate.value,
    days:endDate.value?Math.ceil((new Date(endDate.value)-new Date(startDate.value))/86400000)+1:"In Progress",
    docs:[...tempDocs]
  };

  editRecIndex===null?records.push(rec):records[editRecIndex]=rec;
  localStorage.setItem("records",JSON.stringify(records));
  closeRecord(); renderTable();
};

function renderTable(){
  recordTable.innerHTML="";
  records.sort((a,b)=>b.soNum-a.soNum).forEach((r,i)=>{
    recordTable.innerHTML+=`
      <tr>
        <td>${r.so}</td>
        <td>${r.lorry}</td>
        <td>${r.driver}</td>
        <td>${r.helper}</td>
        <td>${r.start}</td>
        <td>${r.end||"-"}</td>
        <td>${r.days}</td>
        <td>
          <button onclick="share(${i})">🟢</button>
          <button onclick="editRec(${i})">✏️</button>
          <button onclick="delRec(${i})">❌</button>
        </td>
      </tr>`;
  });
}

function share(i){
  const r=records[i];
  const msg=`"${r.start}" Loaded
Order Number - ${r.so}
Lorry Number - ${r.lorry}
Driver - ${r.driver} - ${r.dPhone}
Poter - ${r.helper} - ${r.hPhone}`;
  window.open("https://wa.me/?text="+encodeURIComponent(msg));
}

function editRec(i){
  editRecIndex=i;
  const r=records[i];
  soNumber.value=r.so;
  lorryNumber.value=r.lorry;
  startDate.value=r.start;
  endDate.value=r.end||"";
  tempDocs=[...r.docs];
  renderDocs();
  recordModal.style.display="block";
}

function delRec(i){
  records.splice(i,1);
  localStorage.setItem("records",JSON.stringify(records));
  renderTable();
}

/* ---------- UI ---------- */
openFormBtn.onclick=()=>{editRecIndex=null;tempDocs=[];recordForm.reset();renderDocs();recordModal.style.display="block";}
manageContactsBtn.onclick=()=>{contactModal.style.display="block";renderContacts();}
function closeRecord(){recordModal.style.display="none";}
function closeContacts(){contactModal.style.display="none";}

/* INIT */
loadContacts(); renderTable();